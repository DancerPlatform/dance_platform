'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, Loader2, AlertCircle, CheckCircle2, Download, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface UploadResult {
  success: boolean
  message: string
  processed?: {
    profile: number
    choreography: number
    media: number
    performance: number
    directing: number
    workshop: number
    award: number
  }
  errors?: string[]
}

export default function BulkUploadPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        setError('Access denied. Admin privileges required.')
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    setUploadLoading(true)
    setUploadResult(null)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file')
      }

      setUploadResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setUploadLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Alert className="bg-red-500/10 border-red-500/50 max-w-md">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error || 'Access denied. Admin privileges required.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Bulk Upload Portfolio Data</h1>
          <p className="text-gray-400">Upload a single CSV file with all portfolio data</p>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {uploadResult && (
          <Alert className={uploadResult.success ? "bg-green-500/10 border-green-500/50 mb-6" : "bg-yellow-500/10 border-yellow-500/50 mb-6"}>
            {uploadResult.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-yellow-400" />
            )}
            <AlertDescription className={uploadResult.success ? "text-green-400" : "text-yellow-400"}>
              <div className="font-semibold mb-2">{uploadResult.message}</div>
              {uploadResult.processed && (
                <div className="text-sm space-y-1 mt-2">
                  <div className="grid grid-cols-2 gap-2">
                    {uploadResult.processed.profile > 0 && <div>• Profiles: {uploadResult.processed.profile}</div>}
                    {uploadResult.processed.choreography > 0 && <div>• Choreography: {uploadResult.processed.choreography}</div>}
                    {uploadResult.processed.media > 0 && <div>• Media: {uploadResult.processed.media}</div>}
                    {uploadResult.processed.performance > 0 && <div>• Performances: {uploadResult.processed.performance}</div>}
                    {uploadResult.processed.directing > 0 && <div>• Directing: {uploadResult.processed.directing}</div>}
                    {uploadResult.processed.workshop > 0 && <div>• Workshops: {uploadResult.processed.workshop}</div>}
                    {uploadResult.processed.award > 0 && <div>• Awards: {uploadResult.processed.award}</div>}
                  </div>
                </div>
              )}
              {uploadResult.errors && uploadResult.errors.length > 0 && (
                <div className="mt-3 text-sm">
                  <div className="font-semibold mb-1">Errors ({uploadResult.errors.length}):</div>
                  <ul className="list-disc list-inside space-y-0.5 max-h-40 overflow-y-auto">
                    {uploadResult.errors.map((err, idx) => (
                      <li key={idx} className="text-xs">{err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          {/* Instructions Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <ol className="list-decimal list-inside space-y-2">
                <li>Download the CSV template below</li>
                <li>Fill in your portfolio data following the template format</li>
                <li>Each row must specify a <code className="bg-zinc-800 px-1 py-0.5 rounded">section</code> type: profile, choreography, media, performance, directing, workshop, or award</li>
                <li>Upload your completed CSV file</li>
              </ol>
              <div className="bg-zinc-800 border border-zinc-700 rounded p-3 mt-4">
                <div className="text-xs text-gray-400 mb-2">Template sections:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>• <strong>profile</strong> - Artist info</div>
                  <div>• <strong>choreography</strong> - Choreo works</div>
                  <div>• <strong>media</strong> - Video content</div>
                  <div>• <strong>performance</strong> - Performances</div>
                  <div>• <strong>directing</strong> - Directing work</div>
                  <div>• <strong>workshop</strong> - Classes/workshops</div>
                  <div>• <strong>award</strong> - Awards</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upload Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Upload Portfolio Data</CardTitle>
              <CardDescription className="text-gray-400">
                Upload a CSV file containing artist portfolio records
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button
                  variant="outline"
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = '/csv_templates/artist_portfolio_complete_template.csv'
                    link.download = 'artist_portfolio_complete_template.csv'
                    link.click()
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </Button>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                  disabled={uploadLoading}
                />
                <label htmlFor="csv-upload">
                  <Button
                    asChild
                    disabled={uploadLoading}
                    className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                  >
                    <span>
                      {uploadLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload CSV File
                        </>
                      )}
                    </span>
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  CSV files only. The file will be processed row by row.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Documentation Card */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white text-sm">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-300">
              <p>
                Check the{' '}
                <a
                  href="/csv_templates/SINGLE_FILE_README.md"
                  target="_blank"
                  className="text-green-400 hover:text-green-300 underline"
                >
                  complete documentation
                </a>
                {' '}for detailed field descriptions and examples.
              </p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  )
}
