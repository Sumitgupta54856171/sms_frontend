import { useState, useRef, useCallback } from "react";
import { Download, Upload, X } from "lucide-react";
import { toPng } from "html-to-image";

import { Button } from "@/components/ui/button";

export default function IdCardTemplate() {
  const [images, setImages] = useState<(string | null)[]>(Array(10).fill(null));
  const [downloading, setDownloading] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeBox, setActiveBox] = useState<number | null>(null);

  const handleBoxClick = (index: number) => {
    setActiveBox(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeBox !== null) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[activeBox] = reader.result as string;
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again if needed
    e.target.value = "";
  };

  const handleRemove = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);
  };

  const handleDownload = useCallback(async () => {
    if (!printRef.current) return;
    setDownloading(true);

    try {
      const dataUrl = await toPng(printRef.current, {
        quality: 1.0,
        pixelRatio: 4, // High quality
        backgroundColor: "#ffffff",
        style: {
          transform: "scale(1)",
          transformOrigin: "top left",
        },
      });

      const link = document.createElement("a");
      link.download = `ID_Card_Template_A4.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to download:", err);
    } finally {
      setDownloading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 font-sans">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              ID Card Template
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Click on any box to upload an ID card image. Download the complete A4 page as a high-quality PNG.
            </p>
          </div>

          <Button
            onClick={handleDownload}
            disabled={downloading}
            className="gap-2 bg-[#0d9488] hover:bg-[#0a7a6f]"
          >
            {downloading ? (
              <Download className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {downloading ? "Downloading..." : "Download PNG"}
          </Button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* A4 Page Preview */}
        <div className="flex justify-center overflow-auto pb-8">
          <div
            ref={printRef}
            className="bg-white shadow-lg border border-slate-200"
            style={{
              width: "297mm",
              height: "210mm",
              padding: "10mm 7mm",
              boxSizing: "border-box",
              display: "grid",
              gridTemplateColumns: "repeat(5, 55mm)",
              gridTemplateRows: "repeat(2, 86mm)",
              gap: "2mm 3mm",
              justifyContent: "center",
              alignContent: "center",
            }}
          >
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => handleBoxClick(index)}
                className="relative group cursor-pointer border border-dashed border-slate-300 rounded-sm overflow-hidden hover:border-teal-500 transition-colors"
                style={{ width: "55mm", height: "86mm" }}
              >
                {img ? (
                  <>
                    <img
                      src={img}
                      alt={`ID Card ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={(e) => handleRemove(e, index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 group-hover:text-teal-600 transition-colors">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-xs font-medium">Click to upload</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
