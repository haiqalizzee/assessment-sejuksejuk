"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  X, ChevronLeft, ChevronRight, Download, Play, Pause, AlertCircle
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface File {
  name: string
  url: string
  type: string
  size?: number
}

interface FileViewerModalProps {
  isOpen: boolean
  onClose: () => void
  files: File[]
  initialIndex?: number
}

const MAX_PDF_SIZE = 10 * 1024 * 1024
const MAX_VIDEO_SIZE = 50 * 1024 * 1024

export default function FileViewerModal({
  isOpen,
  onClose,
  files,
  initialIndex = 0
}: FileViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null)

  const currentFile = files[currentIndex]

  useEffect(() => setCurrentIndex(initialIndex), [initialIndex])
  useEffect(() => { if (!isOpen) setIsPlaying(false) }, [isOpen])

  const goToPrevious = () => {
    setCurrentIndex(prev => (prev === 0 ? files.length - 1 : prev - 1))
    setIsPlaying(false)
  }

  const goToNext = () => {
    setCurrentIndex(prev => (prev === files.length - 1 ? 0 : prev + 1))
    setIsPlaying(false)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return
    switch (e.key) {
      case "ArrowLeft": goToPrevious(); break
      case "ArrowRight": goToNext(); break
      case "Escape": onClose(); break
      case " ": {
        if (currentFile.type === "video" && canPreviewVideo()) {
          e.preventDefault()
          togglePlayPause()
        }
        break
      }
    }
  }

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, currentIndex, isPlaying])

  const togglePlayPause = () => {
    if (videoRef) {
      isPlaying ? videoRef.pause() : videoRef.play()
      setIsPlaying(!isPlaying)
    }
  }

  const handleVideoPlay = () => setIsPlaying(true)
  const handleVideoPause = () => setIsPlaying(false)

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size"
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  const getFileTypeBadge = (type: string) => {
    const base = "border"
    switch (type) {
      case "image": return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Image</Badge>
      case "video": return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Video</Badge>
      case "pdf": return <Badge className="bg-red-50 text-red-700 border-red-200">PDF</Badge>
      default: return <Badge className="bg-gray-50 text-gray-700 border-gray-200">File</Badge>
    }
  }

  const canPreviewPdf = () => !currentFile.size || currentFile.size <= MAX_PDF_SIZE
  const canPreviewVideo = () => !currentFile.size || currentFile.size <= MAX_VIDEO_SIZE

  const renderFileContent = () => {
    switch (currentFile.type) {
      case "image":
        return (
          <div className="flex items-center justify-center w-full h-full p-4">
            <img
              src={currentFile.url}
              alt={currentFile.name}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )

      case "video":
        if (!canPreviewVideo()) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-gray-600 font-medium mb-2">File too large to preview</p>
              <p className="text-sm text-gray-500 mb-4">
                File size: {formatFileSize(currentFile.size)}<br />
                Max preview: {formatFileSize(MAX_VIDEO_SIZE)}
              </p>
              <Button onClick={() => window.open(currentFile.url, "_blank")}>
                <Download className="w-4 h-4 mr-2" /> Download Video
              </Button>
            </div>
          )
        }
        return (
          <div className="flex items-center justify-center w-full h-full p-4">
            <video
              ref={setVideoRef}
              src={currentFile.url}
              controls
              className="w-full h-full object-contain"
              onPlay={handleVideoPlay}
              onPause={handleVideoPause}
            />
          </div>
        )

      case "pdf":
        if (!canPreviewPdf()) {
          return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <AlertCircle className="w-6 h-6 text-yellow-500 mb-2" />
              <p className="text-gray-600 font-medium mb-2">File too large to preview</p>
              <p className="text-sm text-gray-500 mb-4">
                File size: {formatFileSize(currentFile.size)}<br />
                Max preview: {formatFileSize(MAX_PDF_SIZE)}
              </p>
              <Button onClick={() => window.open(currentFile.url, "_blank")}>
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
            </div>
          )
        }
        return (
          <div className="w-full h-full overflow-hidden">
            <iframe
              src={`${currentFile.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              title={currentFile.name}
              className="w-full h-full border-0"
            />
          </div>
        )

      default:
        return (
          <div className="flex items-center justify-center h-full w-full p-4 text-center">
            <div>
              <p className="mb-2 text-gray-600">Preview not available</p>
              <Button onClick={() => window.open(currentFile.url, "_blank")}>
                <Download className="w-4 h-4 mr-2" /> Download File
              </Button>
            </div>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <div className="flex flex-col h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-gray-900">{currentFile.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                  {getFileTypeBadge(currentFile.type)}
                  <span>{currentIndex + 1} of {files.length}</span>
                  {currentFile.size && (
                    <span>({formatFileSize(currentFile.size)})</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {currentFile.type === "video" && canPreviewVideo() && (
                <Button variant="outline" size="sm" onClick={togglePlayPause}>
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => window.open(currentFile.url, "_blank")}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          {files.length > 1 && (
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
              <Button variant="ghost" size="sm" onClick={goToPrevious}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <div className="flex gap-1">
                {files.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentIndex ? "bg-blue-500" : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={goToNext}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 bg-gray-100 overflow-hidden">
            {renderFileContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
