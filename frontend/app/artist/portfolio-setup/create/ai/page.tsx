"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState } from "react";
import { Loader2, Upload, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Header } from "@/components/header";
import { useRouter } from "next/navigation";

type PortfolioType = "artist" | "team";

export default function CreateWithAiPage() {
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
    } catch (error) {
      console.error("Error extracting data:", error);
      setError(error instanceof Error ? error.message : "Failed to extract data");
    } finally {
      setIsExtracting(false);
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
        </div>

        {/* Step 1: Select Portfolio Type */}
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

        {/* Step 2: Enter and Validate ID */}
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

        {/* Step 3: Input Method Selection and Upload */}
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
                  placeholder="Paste your portfolio information here. Include details like name, introduction, choreography work, performances, awards, etc."
                  className="min-h-[200px] mt-2"
                  disabled={!isIdValid || isExtracting}
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
                  disabled={!isIdValid || isExtracting}
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <Button
              onClick={handleExtract}
              disabled={!isIdValid || isExtracting || (inputMethod === "text" ? !textInput.trim() : !selectedFile)}
              className="w-full bg-green-500"
              size="lg"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting with AI...
                </>
              ) : (
                "Extract Portfolio Data"
              )}
            </Button>
          </div>
        </Card>

        {/* Step 4: Results */}
        {extractedData && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Step 4: Review Extracted Data</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto">
              <pre className="text-sm whitespace-pre-wrap">
                {JSON.stringify(extractedData, null, 2)}
              </pre>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" onClick={() => {
                // TODO: Navigate to portfolio editor with this data 
                console.log("Edit data:", extractedData);
              }}>
                Continue to Edit
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
        )}
      </div>
    </div>
  );
}
