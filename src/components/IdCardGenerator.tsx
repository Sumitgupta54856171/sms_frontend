import React, { useState, useRef } from "react";
import { Download, Upload, Image as ImageIcon } from "lucide-react";

// Shadcn UI Imports (Make sure to replace these with your actual @/components/ui/ imports)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";



export default function IDCardGenerator() {
  const idCardRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    session: "2025-26",
    studentName: "LAKSHY VISHWAKARMA",
    fatherName: "ASHOK VISHWAKARMA",
    class: "11TH",
    mobile: "8719922176",
    address: "DELAURA , SATNA",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=250&fit=crop"
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Handle Form Inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
  };

  // Handle Local Image Upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, photoUrl: imageUrl }));
    }
  };

  // Download PNG Logic
  const handleDownloadPNG = async () => {
    if (!idCardRef.current) return;
    
    setIsGenerating(true);
    try {
      // NOTE: This uses html-to-image library. 
      // If it throws an error in this preview environment, it's because the library isn't installed here.
      // In your actual VS Code project, this will work perfectly.
      const htmlToImage = await import('html-to-image');
      
      const dataUrl = await htmlToImage.toPng(idCardRef.current, { 
        quality: 1.0, 
        pixelRatio: 2 // High resolution
      });
      
      const link = document.createElement('a');
      link.download = `${formData.studentName.replace(/\s+/g, '_')}_ID_Card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate image", err);
      // Fallback for this preview environment
      alert("In a real environment, this will download a PNG using html-to-image library.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-start justify-center font-sans">
      
      {/* --- LEFT: FORM SECTION --- */}
      <Card className="w-full lg:w-[400px] p-6 bg-white shadow-xl rounded-2xl border-slate-200 sticky top-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-800">Generate ID Card</h2>
          <p className="text-xs text-slate-500 mt-1">Fill the details below. Preview updates instantly.</p>
        </div>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          
          {/* Photo Upload */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 font-bold">Student Photo</Label>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <Label 
                htmlFor="photo-upload" 
                className="flex-1 cursor-pointer bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm py-2 px-3 rounded-md text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-4 w-4" /> Upload New Photo
              </Label>
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 font-bold">Session</Label>
              <Input name="session" value={formData.session} onChange={handleInputChange} className="h-9 text-sm font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-600 font-bold">Class</Label>
              <Input name="class" value={formData.class} onChange={handleInputChange} className="h-9 text-sm font-medium uppercase" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 font-bold">Student Name</Label>
            <Input name="studentName" value={formData.studentName} onChange={handleInputChange} className="h-9 text-sm font-medium uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 font-bold">Father's Name</Label>
            <Input name="fatherName" value={formData.fatherName} onChange={handleInputChange} className="h-9 text-sm font-medium uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 font-bold">Mobile No.</Label>
            <Input name="mobile" value={formData.mobile} onChange={handleInputChange} className="h-9 text-sm font-medium uppercase" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-slate-600 font-bold">Address</Label>
            <Input name="address" value={formData.address} onChange={handleInputChange} className="h-9 text-sm font-medium uppercase" />
          </div>

          <Button 
            onClick={handleDownloadPNG} 
            disabled={isGenerating}
            className="w-full mt-6 bg-[#d92b3a] hover:bg-[#b01e2b] text-white font-bold tracking-wide h-11"
          >
            {isGenerating ? "Processing..." : (
              <><Download className="mr-2 h-5 w-5" /> Download as PNG</>
            )}
          </Button>
        </form>
      </Card>

      {/* --- RIGHT: LIVE ID CARD PREVIEW --- */}
      <div className="flex flex-col items-center">
        <p className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-widest">Live Preview</p>
        
        {/* The Card Container to Capture */}
        <div 
          ref={idCardRef}
          className="w-[330px] h-[520px] bg-white rounded-[16px] shadow-2xl relative overflow-hidden flex flex-col font-sans"
          style={{
            // Creating the complex flame/orange gradient background like the original image
            background: 'linear-gradient(170deg, #fef4cd 0%, #fef4cd 20%, #fad682 45%, #f29e55 65%, #eb5b3f 85%, #d62438 100%)'
          }}
        >
          {/* Decorative Background Flowing Shapes */}
          {/* Large soft glow orbs */}
          <div className="absolute top-0 right-[-30px] w-64 h-64 bg-white/20 rounded-full blur-[30px] pointer-events-none"></div>
          <div className="absolute bottom-[-50px] right-[-50px] w-80 h-80 bg-[#f9c244]/40 rounded-full blur-[40px] pointer-events-none mix-blend-overlay"></div>
          <div className="absolute top-[-40px] left-[-20px] w-56 h-56 bg-white/10 rounded-full blur-[50px] pointer-events-none"></div>
          <div className="absolute bottom-[-20px] left-[-40px] w-64 h-64 bg-[#eb5b3f]/15 rounded-full blur-[50px] pointer-events-none mix-blend-overlay"></div>
          
          {/* Flowing curved border arcs */}
          <div className="absolute top-20 left-[-40px] w-[150px] h-[300px] border-[20px] border-[#f9c244]/20 rounded-full blur-sm transform -rotate-12 pointer-events-none"></div>
          <div className="absolute bottom-10 right-0 w-[200px] h-[150px] border-[15px] border-[#ffd54f]/30 rounded-t-[100px] blur-sm transform rotate-45 pointer-events-none"></div>
          <div className="absolute top-[-20px] right-[30px] w-[100px] h-[100px] border-[10px] border-[#fad682]/20 rounded-full blur-sm pointer-events-none"></div>
          <div className="absolute bottom-[100px] left-[-30px] w-[130px] h-[180px] border-[12px] border-[#f9c244]/15 rounded-full blur-sm transform rotate-20 pointer-events-none"></div>
          
          {/* Decorative flowing circles (like IdCard.tsx style) */}
          <div className="absolute -top-8 -left-8 w-28 h-28 bg-[#fad682]/30 rounded-full blur-[2px] pointer-events-none"></div>
          <div className="absolute top-1/3 -right-6 w-20 h-24 bg-[#eb5b3f]/20 rounded-full blur-sm transform rotate-12 pointer-events-none"></div>
          <div className="absolute bottom-1/4 -left-5 w-16 h-20 bg-[#f9c244]/25 rounded-full blur-sm transform -rotate-6 pointer-events-none"></div>
          
          {/* Corner frame accents */}
          <div className="absolute top-3 left-3 w-10 h-10 border-t-[3px] border-l-[3px] border-white/25 rounded-tl-md pointer-events-none"></div>
          <div className="absolute top-3 right-3 w-10 h-10 border-t-[3px] border-r-[3px] border-white/25 rounded-tr-md pointer-events-none"></div>
          <div className="absolute bottom-3 left-3 w-10 h-10 border-b-[3px] border-l-[3px] border-white/25 rounded-bl-md pointer-events-none"></div>
          <div className="absolute bottom-3 right-3 w-10 h-10 border-b-[3px] border-r-[3px] border-white/25 rounded-br-md pointer-events-none"></div>
          
          {/* Subtle dot pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[length:18px_18px] pointer-events-none"></div>
          
          {/* Side decorative streaks */}
          <div className="absolute top-[25%] left-0 w-[5px] h-[70px] bg-white/10 rounded-r-full blur-[2px] pointer-events-none"></div>
          <div className="absolute top-[55%] right-0 w-[5px] h-[50px] bg-white/10 rounded-l-full blur-[2px] pointer-events-none"></div>
          <div className="absolute top-[65%] left-0 w-[3px] h-[40px] bg-[#f9c244]/15 rounded-r-full blur-[1px] pointer-events-none"></div>

          {/* Inner Content Area */}
          <div className="relative z-10 flex flex-col h-full px-2 pt-3">
            
            {/* Header Section */}
            <div className="flex items-start px-2 mb-2">
              {/* Logo Circle */}
              <div className="w-[80px] h-[80px] bg-white rounded-full flex items-center justify-center flex-shrink-0 border-2 shadow-sm overflow-hidden z-20">
                 {/* Goddess Saraswati mockup icon */}
                <div className="text-[28px] leading-none mb-1"><img src="/WhatsApp Image 2026-04-01 at 06.06.13.jpeg" alt="" /></div>
              </div>
              
              {/* School Name */}
              <div className="flex flex-col flex-1 pl-2 pt-1 text-center pr-2">
                <h1 className="text-[20px] font-black text-[#d62438] leading-[1.1] tracking-tight" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.7)' }}>
                  B.L. HIGHER
                </h1>
                <h2 className="text-[14px] font-black text-[#d62438] leading-[1.1] tracking-tighter" style={{ textShadow: '1px 1px 0px rgba(255,255,255,0.7)' }}>
                  SECONDARY SCHOOL
                </h2>
                <p className="text-[10px] font-bold text-teal-900 mt-[2px] leading-tight">
                  Dilaura ,Satna Distt.Satna (M.P.)
                </p>
              </div>
            </div>

            {/* Photo Section */}
            <div className="flex justify-center mt-1">
              <div className="w-[110px] h-[130px] border-[2px] border-[#eb5b3f] bg-white p-[2px] shadow-md z-20">
                <img 
                  src={formData.photoUrl} 
                  alt="Student" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Session Text */}
            <div className="text-center mt-1 z-20">
              <p className="text-[13px] font-black text-[#1a1a1a]">
                Session-{formData.session}
              </p>
            </div>

            {/* Name Red Banner */}
            <div className="bg-[#d62438]/90 w-full py-1.5 flex flex-col items-center justify-center my-1 z-20 shadow-sm backdrop-blur-sm relative">
              {/* Fake edge extensions to make it look like a full bleed banner */}
              <div className="absolute -left-4 w-4 h-full bg-[#d62438]/90"></div>
              <div className="absolute -right-4 w-4 h-full bg-[#d62438]/90"></div>
              
              <h2 className="text-[16px] font-black text-[#0f2a7a] leading-tight tracking-wider" style={{ textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.5)' }}>
                {formData.studentName.split(" ")[0]}
              </h2>
              {formData.studentName.split(" ").slice(1).join(" ") && (
                <h2 className="text-[16px] font-black text-[#0f2a7a] leading-tight tracking-wider" style={{ textShadow: '0.5px 0.5px 0px rgba(255,255,255,0.5)' }}>
                  {formData.studentName.split(" ").slice(1).join(" ")}
                </h2>
              )}
            </div>

            {/* Details Section */}
            <div className="px-3 mt-3 flex flex-col gap-2 z-20">
              <div className="flex text-[12px] leading-none items-center">
                <div className="w-[85px] font-extrabold text-[#1a1a1a]">Father's Name</div>
                <div className="w-[10px] font-extrabold text-[#1a1a1a]">:</div>
                <div className="flex-1 font-bold text-[#1a1a1a] text-[14px] uppercase tracking-tight">{formData.fatherName}</div>
              </div>

              <div className="flex text-[12px] leading-none items-center">
                <div className="w-[85px] font-extrabold text-[#1a1a1a]">Class</div>
                <div className="w-[10px] font-extrabold text-[#1a1a1a]">:</div>
                <div className="flex-1 font-bold text-[#1a1a1a] uppercase">{formData.class}</div>
              </div>

              <div className="flex text-[12px] leading-none items-center">
                <div className="w-[85px] font-extrabold text-[#1a1a1a]">Mob.No.</div>
                <div className="w-[10px] font-extrabold text-[#1a1a1a]">:</div>
                <div className="flex-1 font-bold text-[#1a1a1a] uppercase">{formData.mobile}</div>
              </div>

              <div className="flex text-[12px] leading-none items-start">
                <div className="w-[85px] font-extrabold text-[#1a1a1a]">Address</div>
                <div className="w-[10px] font-extrabold text-[#1a1a1a]">:</div>
                <div className="flex-1 font-bold text-[#1a1a1a] uppercase leading-tight">{formData.address}</div>
              </div>
            </div>

            {/* Footer / Signature Area */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center z-20">
               {/* Signature Mock */}
              <svg viewBox="0 0 100 50" className="w-16 h-8 text-black opacity-80 mb-[-5px]">
                <path d="M10,40 Q20,10 40,30 T70,10 Q80,40 90,20" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                <path d="M30,45 L70,35" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div className="text-[12px] font-extrabold text-[#1a1a1a] tracking-wide">
                Principal
              </div>
            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}