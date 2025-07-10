"use client"

import type React from "react"

import { useState, useRef } from "react"
import { ChevronDown, ImageIcon, Folder, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface ProcessedImage {
  original: string
  upscaled: string
  fileName: string
}

export default function Dashboard() {
  const [selectedModel, setSelectedModel] = useState("General Photo")
  const [upscaleValue, setUpscaleValue] = useState([2])
  const [isUpscaleEnabled, setIsUpscaleEnabled] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [outputFolder, setOutputFolder] = useState<string>("")
  const [previewImage, setPreviewImage] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const models = [
    { name: "General Photo", color: "bg-gradient-to-r from-pink-500 to-violet-500" },
    { name: "Real-ESRGAN", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
    { name: "Light Photo", color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
    { name: "Ultra HD", color: "bg-gradient-to-r from-green-500 to-emerald-500" },
  ]

  const currentModel = models.find((model) => model.name === selectedModel) || models[0]

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      const fileArray = Array.from(files)
      setSelectedFiles(fileArray)

      // Create preview for first image
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(fileArray[0])
    }
  }

  const handleOutputFolderSelect = async () => {
    try {
      // @ts-ignore - showDirectoryPicker is not yet in TypeScript types
      if ("showDirectoryPicker" in window) {
        // @ts-ignore
        const dirHandle = await window.showDirectoryPicker()
        setOutputFolder(dirHandle.name)
      } else {
        alert("Seleção de pasta não suportada neste navegador. Use Chrome/Edge mais recente.")
      }
    } catch (error) {
      console.log("Usuário cancelou a seleção da pasta")
    }
  }

  const simulateUpscale = (originalImageUrl: string, scale: number): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Set canvas size to upscaled dimensions
        canvas.width = img.width * scale
        canvas.height = img.height * scale

        // Draw upscaled image with smoothing
        ctx!.imageSmoothingEnabled = true
        ctx!.imageSmoothingQuality = "high"
        ctx!.drawImage(img, 0, 0, canvas.width, canvas.height)

        // Apply some enhancement filters to simulate AI upscaling
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data

        // Simple sharpening filter
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1) // Red
          data[i + 1] = Math.min(255, data[i + 1] * 1.1) // Green
          data[i + 2] = Math.min(255, data[i + 2] * 1.1) // Blue
        }

        ctx!.putImageData(imageData, 0, 0)
        resolve(canvas.toDataURL("image/png"))
      }

      img.src = originalImageUrl
    })
  }

  const handleUpscale = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)
    const results: ProcessedImage[] = []

    for (const file of selectedFiles) {
      const reader = new FileReader()
      const originalUrl = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      })

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const upscaledUrl = await simulateUpscale(originalUrl, upscaleValue[0])

      results.push({
        original: originalUrl,
        upscaled: upscaledUrl,
        fileName: file.name,
      })
    }

    setProcessedImages(results)
    setIsProcessing(false)
  }

  const clearSelection = () => {
    setSelectedFiles([])
    setPreviewImage("")
    setProcessedImages([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-teal-700 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Window Header */}
        <div className="bg-black/20 backdrop-blur-sm rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-white/60 text-sm font-medium">Upwise AI</div>
        </div>

        {/* Main Content */}
        <div className="bg-black/20 backdrop-blur-sm rounded-b-2xl p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div
                onClick={handleFileSelect}
                className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-white/20 rounded-xl hover:border-white/40 transition-colors cursor-pointer"
              >
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white/60" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-3">
                    {selectedFiles.length > 0 ? `${selectedFiles.length} arquivo(s) selecionado(s)` : "Start Upscaling"}
                  </h2>
                  <p className="text-white/60 text-lg">
                    {selectedFiles.length > 0 ? (
                      selectedFiles.map((file) => file.name).join(", ")
                    ) : (
                      <>
                        Select or drag and drop a PNG, JPG,
                        <br />
                        JPEG or WEBP images.
                      </>
                    )}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpg,image/jpeg,image/webp"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Preview Area */}
            {previewImage && (
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">Preview</h3>
                    <Button
                      onClick={clearSelection}
                      variant="ghost"
                      size="sm"
                      className="text-white/60 hover:text-white hover:bg-white/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                    <img
                      src={previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-white/60 text-sm mt-2 truncate">{selectedFiles[0]?.name}</p>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            {/* Model Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="bg-white/10 hover:bg-white/20 text-white border-0 h-12 px-4 rounded-full"
                >
                  <div className={`w-4 h-4 rounded-full mr-3 ${currentModel.color}`}></div>
                  {selectedModel}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 backdrop-blur-sm border-white/20">
                {models.map((model) => (
                  <DropdownMenuItem
                    key={model.name}
                    onClick={() => setSelectedModel(model.name)}
                    className="text-white hover:bg-white/10 cursor-pointer"
                  >
                    <div className={`w-4 h-4 rounded-full mr-3 ${model.color}`}></div>
                    {model.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Divider */}
            <div className="w-px h-12 bg-white/20"></div>

            {/* Scale Selector */}
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white mb-1">{upscaleValue[0]}X</div>
                <div className="text-white/60 text-sm">
                  {upscaleValue[0] === 2 ? "Double upscale" : `${upscaleValue[0]}x upscale`}
                </div>
              </div>
              <div className="w-32">
                <Slider
                  value={upscaleValue}
                  onValueChange={setUpscaleValue}
                  max={16}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Output Folder */}
            <Button
              onClick={handleOutputFolderSelect}
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border-0 h-12 px-4 rounded-full"
            >
              <Folder className="w-4 h-4 mr-2" />
              {outputFolder || "Output folder"}
            </Button>

            {/* Upscale Button */}
            <Button
              onClick={handleUpscale}
              disabled={selectedFiles.length === 0 || isProcessing}
              className="flex items-center gap-3 bg-white/90 hover:bg-white text-black px-6 py-3 rounded-full font-medium transition-colors disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <span>Upscale</span>
                  <Switch
                    checked={isUpscaleEnabled}
                    onCheckedChange={setIsUpscaleEnabled}
                    className="data-[state=checked]:bg-blue-500"
                  />
                </>
              )}
            </Button>
          </div>

          {/* Results Section */}
          {processedImages.length > 0 && (
            <div className="mt-12">
              <h3 className="text-2xl font-semibold text-white mb-6 text-center">Results</h3>
              <div className="space-y-8">
                {processedImages.map((result, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                    <h4 className="text-white font-medium mb-4">{result.fileName}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Before */}
                      <div>
                        <h5 className="text-white/80 text-sm mb-2">Before</h5>
                        <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                          <img
                            src={result.original || "/placeholder.svg"}
                            alt="Original"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      {/* After */}
                      <div>
                        <h5 className="text-white/80 text-sm mb-2">After ({upscaleValue[0]}x)</h5>
                        <div className="aspect-square bg-white/5 rounded-lg overflow-hidden">
                          <img
                            src={result.upscaled || "/placeholder.svg"}
                            alt="Upscaled"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
