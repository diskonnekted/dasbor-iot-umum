'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Wifi, WifiOff, Cpu, Zap, HardDrive, Activity, Clock, AlertCircle, CheckCircle, Chip } from 'lucide-react'

interface ESP32Data {
  id: string
  connected: boolean
  lastSeen: string
  ip: string
  mac: string
  chipId: string
  flashSize: number
  freeHeap: number
  cpuFreq: number
  sdkVersion: string
  coreVersion: string
  wifiRssi: number
  uptime: number
  pins: {
    number: number
    available: boolean
    mode: string
    value?: number
  }[]
}

export default function ESP32Dashboard() {
  const [esp32Data, setEsp32Data] = useState<ESP32Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<any>(null)
  const [realTimeEnabled, setRealTimeEnabled] = useState(false)

  // Initialize WebSocket connection
  useEffect(() => {
    const initSocket = () => {
      try {
        // Import socket.io-client dynamically
        import('socket.io-client').then(({ io }) => {
          const socketInstance = io('/', {
            path: '/api/socket/io',
            addTrailingSlash: false
          })

          socketInstance.on('connect', () => {
            console.log('Connected to WebSocket server')
            setRealTimeEnabled(true)
            socketInstance.emit('join-room', 'esp32-monitor')
          })

          socketInstance.on('esp32-update', (data: ESP32Data) => {
            console.log('Real-time ESP32 update received:', data)
            setEsp32Data(data)
            setError(null)
          })

          socketInstance.on('disconnect', () => {
            console.log('Disconnected from WebSocket server')
            setRealTimeEnabled(false)
          })

          setSocket(socketInstance)

          return () => {
            socketInstance.disconnect()
          }
        }).catch(err => {
          console.log('Socket.io not available, falling back to polling')
          setRealTimeEnabled(false)
        })
      } catch (err) {
        console.log('WebSocket initialization failed, using polling')
        setRealTimeEnabled(false)
      }
    }

    initSocket()
  }, [])

  // Fetch ESP32 data periodically (fallback when WebSocket is not available)
  useEffect(() => {
    if (realTimeEnabled) return // Don't poll if WebSocket is active

    const fetchData = async () => {
      try {
        const response = await fetch('/api/esp32/status')
        if (response.ok) {
          const data = await response.json()
          setEsp32Data(data)
          setError(null)
        } else {
          setError('Gagal mengambil data ESP32')
        }
      } catch (err) {
        setError('Koneksi error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [realTimeEnabled])

  // Initial data fetch
  useEffect(() => {
    if (!esp32Data && !realTimeEnabled) {
      setLoading(true)
      fetch('/api/esp32/status')
        .then(res => res.json())
        .then(data => {
          setEsp32Data(data)
          setLoading(false)
        })
        .catch(err => {
          setError('Gagal mengambil data awal')
          setLoading(false)
        })
    }
  }, [esp32Data, realTimeEnabled])

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}j ${minutes}m ${secs}s`
  }

  const getSignalStrength = (rssi: number) => {
    if (rssi > -50) return { label: 'Sangat Baik', color: 'bg-green-500' }
    if (rssi > -60) return { label: 'Baik', color: 'bg-green-400' }
    if (rssi > -70) return { label: 'Cukup', color: 'bg-yellow-500' }
    return { label: 'Lemah', color: 'bg-red-500' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <Activity className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Menghubungkan ke ESP32...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">ESP32 Monitor Dashboard</h1>
              <p className="text-gray-600 mt-1">Domain: https://desa.orbitdev.id/</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={realTimeEnabled ? "default" : "secondary"}>
                  {realTimeEnabled ? "Real-time Aktif" : "Polling Mode"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {esp32Data?.connected ? (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  <Wifi className="w-4 h-4 mr-1" />
                  Terhubung
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <WifiOff className="w-4 h-4 mr-1" />
                  Terputus
                </Badge>
              )}
            </div>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {esp32Data && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              <TabsTrigger value="specifications">Spesifikasi</TabsTrigger>
              <TabsTrigger value="pins">Status Pin</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Status Koneksi</CardTitle>
                    {esp32Data.connected ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {esp32Data.connected ? 'Online' : 'Offline'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      IP: {esp32Data.ip || 'N/A'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Signal WiFi</CardTitle>
                    <Wifi className="w-4 h-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{esp32Data.wifiRssi} dBm</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-2 h-2 rounded-full ${getSignalStrength(esp32Data.wifiRssi).color}`}></div>
                      <p className="text-xs text-muted-foreground">
                        {getSignalStrength(esp32Data.wifiRssi).label}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Memory Tersedia</CardTitle>
                    <Chip className="w-4 h-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{esp32Data.freeHeap} KB</div>
                    <Progress 
                      value={(esp32Data.freeHeap / 327680) * 100} 
                      className="mt-2" 
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                    <Clock className="w-4 h-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatUptime(esp32Data.uptime)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Terakhir dilihat: {new Date(esp32Data.lastSeen).toLocaleString('id-ID')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Specifications Tab */}
            <TabsContent value="specifications" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Informasi Chip
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chip ID:</span>
                      <span className="font-mono">{esp32Data.chipId}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">MAC Address:</span>
                      <span className="font-mono">{esp32Data.mac}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Frekuensi CPU:</span>
                      <span>{esp32Data.cpuFreq} MHz</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ukuran Flash:</span>
                      <span>{(esp32Data.flashSize / 1024 / 1024).toFixed(1)} MB</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Informasi Software
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versi SDK:</span>
                      <span className="font-mono text-sm">{esp32Data.sdkVersion}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Versi Core:</span>
                      <span className="font-mono text-sm">{esp32Data.coreVersion}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">Free Heap:</span>
                      <span>{esp32Data.freeHeap} bytes</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="text-gray-600">IP Address:</span>
                      <span className="font-mono">{esp32Data.ip}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Pins Tab */}
            <TabsContent value="pins" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="w-5 h-5" />
                    Status Pin GPIO
                  </CardTitle>
                  <CardDescription>
                    Menampilkan status ketersediaan dan mode pin GPIO ESP32
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {esp32Data.pins.map((pin) => (
                      <div
                        key={pin.number}
                        className={`p-3 rounded-lg border ${
                          pin.available 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm">GPIO{pin.number}</span>
                          <div className={`w-2 h-2 rounded-full ${
                            pin.available ? 'bg-green-500' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div className="text-xs text-gray-600">
                          <div>{pin.mode}</div>
                          {pin.value !== undefined && (
                            <div>Value: {pin.value}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Tersedia</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                      <span>Tidak Tersedia</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}