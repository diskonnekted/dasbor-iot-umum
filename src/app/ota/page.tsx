'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, CheckCircle, AlertCircle, Clock, HardDrive } from 'lucide-react'

interface Firmware {
  id: string
  deviceId: string
  filename: string
  version: string
  size: number
  uploadedAt: string
  isActive: boolean
}

export default function OTAManager() {
  const [firmwareList, setFirmwareList] = useState<Firmware[]>([])
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [version, setVersion] = useState('')
  const [chipId, setChipId] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchFirmwareList()
  }, [])

  const fetchFirmwareList = async () => {
    try {
      const response = await fetch('/api/ota/firmware')
      if (response.ok) {
        const data = await response.json()
        setFirmwareList(data.firmware || [])
      }
    } catch (error) {
      console.error('Failed to fetch firmware list:', error)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedFile || !chipId) {
      alert('Please select a file and enter chip ID')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('firmware', selectedFile)
      formData.append('chipId', chipId)
      formData.append('version', version || new Date().toISOString().split('T')[0])

      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        setUploading(false)
        setUploadProgress(0)
        setSelectedFile(null)
        setVersion('')
        fetchFirmwareList()
        alert('Firmware uploaded successfully!')
      })

      xhr.addEventListener('error', () => {
        setUploading(false)
        setUploadProgress(0)
        alert('Failed to upload firmware')
      })

      xhr.open('POST', '/api/ota/firmware')
      xhr.send(formData)

    } catch (error) {
      console.error('Upload error:', error)
      setUploading(false)
      setUploadProgress(0)
      alert('Failed to upload firmware')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESP32 OTA Manager</h1>
              <p className="text-gray-600 mt-1">Over-The-Air Firmware Update System</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload Firmware</TabsTrigger>
            <TabsTrigger value="list">Firmware List</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New Firmware
                </CardTitle>
                <CardDescription>
                  Upload .bin firmware file for ESP32 devices
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="chipId">Device Chip ID</Label>
                      <Input
                        id="chipId"
                        type="text"
                        value={chipId}
                        onChange={(e) => setChipId(e.target.value)}
                        placeholder="ESP32-001"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">Version</Label>
                      <Input
                        id="version"
                        type="text"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0.0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="firmware">Firmware File (.bin)</Label>
                    <Input
                      id="firmware"
                      type="file"
                      accept=".bin"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      required
                    />
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Upload Progress</span>
                        <span className="text-sm font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={uploading || !selectedFile}
                    className="w-full"
                  >
                    {uploading ? 'Uploading...' : 'Upload Firmware'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Firmware List Tab */}
          <TabsContent value="list" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Firmware Library
                </CardTitle>
                <CardDescription>
                  List of uploaded firmware versions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {firmwareList.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No firmware uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-2">Upload your first firmware to get started</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {firmwareList.map((firmware) => (
                      <div key={firmware.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{firmware.filename}</h3>
                              <Badge variant={firmware.isActive ? "default" : "secondary"}>
                                {firmware.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {formatDate(firmware.uploadedAt)}
                              </span>
                              <span className="flex items-center gap-1">
                                <HardDrive className="w-4 h-4" />
                                {formatFileSize(firmware.size)}
                              </span>
                              <span>Device: {firmware.deviceId}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/api/ota/download/${firmware.id}`, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}