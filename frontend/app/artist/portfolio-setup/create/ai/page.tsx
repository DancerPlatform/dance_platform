"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2, Upload, FileText, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type PortfolioType = "artist" | "team";

interface MissingField {
  section: string;
  field: string;
  path: string;
}

export default function CreateWithAiPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [portfolioType, setPortfolioType] = useState<PortfolioType>("artist");
  const [artistId, setArtistId] = useState("");
  const [isValidatingId, setIsValidatingId] = useState(false);
  const [isIdValid, setIsIdValid] = useState<boolean | null>(null);
  const [idValidationMessage, setIdValidationMessage] = useState("");

  const [inputMethod, setInputMethod] = useState<"text" | "pdf">("text");
  const [textInput, setTextInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  // Validate artist ID
  const validateArtistId = async () => {
    if (!artistId.trim()) {
      setIsIdValid(null);
      setIdValidationMessage("");
      return;
    }

    setIsValidatingId(true);
    setIsIdValid(null);
    setIdValidationMessage("");

    try {
      const response = await fetch(
        `/api/check-artist-id?artist_id=${encodeURIComponent(artistId)}`
      );
      const data = await response.json();

      if (data.available) {
        setIsIdValid(true);
        setIdValidationMessage("Artist ID is available");
      } else {
        setIsIdValid(false);
        setIdValidationMessage("Artist ID is already taken");
      }
    } catch (error) {
      console.error("Error validating artist ID:", error);
      setIsIdValid(false);
      setIdValidationMessage("Error validating ID");
    } finally {
      setIsValidatingId(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Please select a PDF file");
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError("");
    }
  };

  // Handle AI extraction
  const handleExtract = async () => {
    if (!isIdValid) {
      setError("Please enter a valid artist/team ID first");
      return;
    }

    if (inputMethod === "text" && !textInput.trim()) {
      setError("Please enter text to extract from");
      return;
    }

    if (inputMethod === "pdf" && !selectedFile) {
      setError("Please select a PDF file");
      return;
    }

    setIsExtracting(true);
    setError("");
    setExtractedData(null);

    try {
      const formData = new FormData();
      formData.append("type", portfolioType);

      if (inputMethod === "text") {
        formData.append("text", textInput);
      } else {
        formData.append("file", selectedFile!);
      }

      const response = await fetch("/api/ai/extract-portfolio", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to extract data");
      }

      // Add the validated ID to the extracted data
      if (portfolioType === "artist") {
        result.data.profile.artist_id = artistId;
      } else {
        result.data.team_profile.team_id = artistId;
      }

      setExtractedData(result.data);
      setCurrentStep(4); // Move to step 4 after successful extraction
    } catch (error) {
      console.error("Error extracting data:", error);
      setError(error instanceof Error ? error.message : "Failed to extract data");
    } finally {
      setIsExtracting(false);
    }
  };

  // Analyze extracted data using AI validation metadata
  const analyzeMissingFields = (data: Record<string, unknown>): MissingField[] => {
    const missingFields: MissingField[] = [];

    const analyzeArrayItems = (
      items: unknown[],
      sectionName: string,
      itemName: string
    ) => {
      items.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          const obj = item as Record<string, unknown>;

          // Check if the item has a _validation object
          const validation = obj._validation as Record<string, string> | undefined;

          if (validation) {
            // Use AI-provided validation metadata
            Object.entries(validation).forEach(([key, status]) => {
              if (status === "invalid") {
                const fieldName = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                const fieldValue = obj[key];
                let reason = "";

                // Add reason based on the actual value
                if (fieldValue === "" || fieldValue === null || fieldValue === undefined) {
                  reason = "empty";
                } else if (typeof fieldValue === "string") {
                  if (fieldValue === "9999-01-01") {
                    reason = "placeholder date";
                  } else if (/^\d{4}$/.test(fieldValue.trim())) {
                    reason = "missing month and day";
                  } else if (/^\d{4}-\d{2}$/.test(fieldValue.trim())) {
                    reason = "missing day";
                  } else {
                    reason = "incomplete";
                  }
                }

                missingFields.push({
                  section: `${sectionName} #${index + 1}`,
                  field: reason ? `${fieldName} (${reason})` : fieldName,
                  path: `${itemName}[${index}].${key}`,
                });
              }
            });
          }
        }
      });
    };

    if (portfolioType === "artist") {
      if (data.choreography && Array.isArray(data.choreography)) {
        analyzeArrayItems(data.choreography, "Choreography", "choreography");
      }
      if (data.media && Array.isArray(data.media)) {
        analyzeArrayItems(data.media, "Media", "media");
      }
      if (data.performance && Array.isArray(data.performance)) {
        analyzeArrayItems(data.performance, "Performance", "performance");
      }
      if (data.directing && Array.isArray(data.directing)) {
        analyzeArrayItems(data.directing, "Directing", "directing");
      }
      if (data.workshop && Array.isArray(data.workshop)) {
        analyzeArrayItems(data.workshop, "Workshop", "workshop");
      }
      if (data.awards && Array.isArray(data.awards)) {
        analyzeArrayItems(data.awards, "Award", "awards");
      }
    } else {
      if (data.team_members && Array.isArray(data.team_members)) {
        analyzeArrayItems(data.team_members, "Member", "team_members");
      }
      if (data.team_choreography && Array.isArray(data.team_choreography)) {
        analyzeArrayItems(data.team_choreography, "Choreography", "team_choreography");
      }
      if (data.team_media && Array.isArray(data.team_media)) {
        analyzeArrayItems(data.team_media, "Media", "team_media");
      }
      if (data.team_performance && Array.isArray(data.team_performance)) {
        analyzeArrayItems(data.team_performance, "Performance", "team_performance");
      }
      if (data.team_directing && Array.isArray(data.team_directing)) {
        analyzeArrayItems(data.team_directing, "Directing", "team_directing");
      }
      if (data.team_workshop && Array.isArray(data.team_workshop)) {
        analyzeArrayItems(data.team_workshop, "Workshop", "team_workshop");
      }
      if (data.team_awards && Array.isArray(data.team_awards)) {
        analyzeArrayItems(data.team_awards, "Award", "team_awards");
      }
    }

    return missingFields;
  };

  // Handle step navigation
  const handleNextStep = () => {
    // Validate before moving to next step
    if (currentStep === 1) {
      setError("");
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!isIdValid) {
        setError("Please enter and validate your ID first");
        return;
      }
      setError("");
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Trigger extraction instead of moving to step 4
      handleExtract();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError("");
    }
  };

  // Handle saving portfolio to database
  const handleSavePortfolio = async () => {
    if (!extractedData || !artistId) {
      setError("No data to save");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Get the user's session for authentication
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setError("Not authenticated. Please log in.");
        setIsSaving(false);
        return;
      }

      const response = await fetch("/api/ai/save-portfolio", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          type: portfolioType,
          data: extractedData,
          artist_id: artistId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save portfolio");
      }

      // Navigate to the edit page
      if (portfolioType === "artist") {
        router.replace(`/edit-portfolio/${artistId}`);
      } else {
        router.replace(`/edit-team/${artistId}`);
      }
    } catch (error) {
      console.error("Error saving portfolio:", error);
      setError(error instanceof Error ? error.message : "Failed to save portfolio");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-6">
      <Header onBack={() => {router.back()}}/>
      <div className="max-w-4xl mx-auto space-y-6 pt-12">
        <div>
          <h1 className="text-2xl font-bold">Create Portfolio with AI</h1>
          <p className="text-gray-600 text-sm">
            Generate your own portfolio in the click of a few buttons
          </p>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded ${
                  step < currentStep
                    ? "bg-green-500"
                    : step === currentStep
                    ? "bg-green-500/50"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Select Portfolio Type */}
        {currentStep === 1 && (
          <Card className="p-4 bg-black text-white">
            <h2 className="text-xl font-semibold mb-4">Step 1: Select Type</h2>
            <RadioGroup value={portfolioType} onValueChange={(value: string) => setPortfolioType(value as PortfolioType)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="artist" id="artist"/>
                <Label htmlFor="artist" className="cursor-pointer">Artist (Individual)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="team" id="team" />
                <Label htmlFor="team" className="cursor-pointer">Team/Group</Label>
              </div>
            </RadioGroup>
          </Card>
        )}

        {/* Step 2: Enter and Validate ID */}
        {currentStep === 2 && (
          <Card className="p-4 bg-black text-white">
            <h2 className="text-xl font-semibold mb-4">
              Step 2: Enter {portfolioType === "artist" ? "Artist" : "Team"} ID
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="artistId">
                  {portfolioType === "artist" ? "Artist ID" : "Team ID"}
                </Label>
                <div className="flex gap-2 mt-2">
                  <div className="relative flex-1">
                    <Input
                      id="artistId"
                      value={artistId}
                      onChange={(e) => {
                        setArtistId(e.target.value);
                        setIsIdValid(null);
                        setIdValidationMessage("");
                      }}
                      placeholder={portfolioType === "artist" ? "e.g., artist001" : "e.g., team001"}
                      disabled={isExtracting}
                    />
                    {isIdValid !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isIdValid ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={validateArtistId}
                    disabled={!artistId.trim() || isValidatingId || isExtracting}
                  >
                    {isValidatingId ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      "Validate"
                    )}
                  </Button>
                </div>
                {idValidationMessage && (
                  <p className={`text-sm mt-2 ${isIdValid ? "text-green-600" : "text-red-600"}`}>
                    {idValidationMessage}
                  </p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Input Method Selection and Upload */}
        {currentStep === 3 && !isExtracting && (
          <Card className="p-4 bg-black text-white">
            <h2 className="text-xl font-semibold mb-4">Step 3: Provide Portfolio Information</h2>

            <div className="space-y-4">
              <RadioGroup value={inputMethod} onValueChange={(value: string) => setInputMethod(value as "text" | "pdf")}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="text" id="text" />
                  <Label htmlFor="text" className="cursor-pointer flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Text Input
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pdf" id="pdf" />
                  <Label htmlFor="pdf" className="cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    PDF Upload
                  </Label>
                </div>
              </RadioGroup>

              {inputMethod === "text" ? (
                <div>
                  <Label htmlFor="textInput">Portfolio Information</Label>
                  <Textarea
                    id="textInput"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="

Please feel free to enter your portfolio in any format. No specific template is required. Simply paste your details, including your name, bio, career history, and awards.

(形式は自由ですので、経歴をそのままご記入ください。 決まった書式はありません。お名前、自己紹介、活動歴、受賞歴などを自由な形式で貼り付けてください。)"
                    className="min-h-[200px] mt-2"
                    disabled={isExtracting}
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="pdfFile">Upload PDF</Label>
                  <Input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="mt-2"
                    disabled={isExtracting}
                  />
                  {selectedFile && (
                    <p className="text-sm text-gray-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Loading State During Extraction */}
        {isExtracting && (
          <Card className="p-12 bg-black text-white">
            <div className="flex flex-col items-center justify-center space-y-6">
              <Loader2 className="w-16 h-16 animate-spin text-green-500" />
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">Extracting Portfolio Data</h2>
                <p className="text-gray-400">
                  Our AI is analyzing your information and structuring your portfolio...
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Results */}
        {extractedData && (() => {
          const missingFields = analyzeMissingFields(extractedData);

          return (
            <Card className="p-6 bg-black text-white">
              <h2 className="text-xl font-semibold mb-4">Step 4: Review Extracted Data</h2>

              {missingFields.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-greeb-500 mb-2">
                        Portfolio created succesfully
                      </h3>
                      <p className="text-sm text-gray-300 mb-3">
                        But there is some missing information {missingFields.length}
                        You can fill them in on the edit page after saving.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-900 rounded-lg p-4 max-h-[400px] overflow-auto">
                    <ul className="space-y-2">
                      {missingFields.map((field, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-500 font-mono mt-1">•</span>
                          <div className="flex-1">
                            <span className="text-white font-medium">{field.field}</span>
                            <span className="text-gray-500 text-xs ml-2">
                              ({field.section})
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-500 mb-1">
                      All Fields Extracted Successfully
                    </h3>
                    <p className="text-sm text-gray-300">
                      All required information has been extracted from your input.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mt-4">
                  {error}
                </div>
              )}

              <div className="mt-6 flex gap-2">
                <Button
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={handleSavePortfolio}
                  disabled={isSaving}
                  size="lg"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save & Go to Edit Page"
                  )}
                </Button>
                <Button variant="outline" onClick={() => {
                  const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${portfolioType}_${artistId}_portfolio.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  Download JSON
                </Button>
              </div>
            </Card>
          );
        })()}

        {/* Error Display */}
        {error && currentStep !== 4 && (
          <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        {!extractedData && (
          <div className="flex gap-4 pt-4">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={handlePreviousStep}
                disabled={isExtracting}
                size="lg"
              >
                Previous
              </Button>
            )}
            <Button
              onClick={handleNextStep}
              disabled={
                isExtracting ||
                (currentStep === 3 && (inputMethod === "text" ? !textInput.trim() : !selectedFile))
              }
              className="flex-1 bg-green-500 hover:bg-green-600"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting with AI...
                </>
              ) : currentStep === 3 ? (
                "Extract Portfolio Data"
              ) : (
                "Next"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
