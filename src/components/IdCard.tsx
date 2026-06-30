



import { Printer } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function IDCard() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      
      {/* CSS for Print Mode */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * { visibility: hidden; }
          #id-card-container, #id-card-container * { visibility: visible; }
          #id-card-container { 
            position: absolute; 
            left: 50%; 
            top: 50%;
            transform: translate(-50%, -50%);
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
          }
          #print-btn { display: none; }
        }
      `}} />

      {/* Print Button */}
      <div id="print-btn" className="mb-6">
        <Button onClick={handlePrint} className="gap-2 bg-[#1c2b4c] hover:bg-[#121c33] text-white shadow-md">
          <Printer className="h-4 w-4" /> Print ID Card
        </Button>
      </div>

      {/* --- ID CARD START --- */}
      <Card 
        id="id-card-container" 
        className="w-[320px] h-[490px] bg-white rounded-[12px] shadow-2xl relative overflow-hidden border-2 border-slate-200"
      >
        {/* Background Watermark Simulation */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-48 h-48 fill-current text-slate-900">
            <path d="M50 0 C20 0 0 20 0 50 C0 80 20 100 50 100 C80 100 100 80 100 50 C100 20 80 0 50 0 Z" />
            <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" fill="white" />
          </svg>
        </div>

        {/* --- HEADER SECTION --- */}
        <div className="relative h-[130px] w-full">
          {/* Main Dark Blue Slanted Shape */}
          <div 
            className="absolute top-0 left-0 w-full h-[120px] bg-[#1a2b4c] z-10"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }}
          ></div>
          
          {/* Top Left Pinkish Accent Blob */}
          <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#e6b1b1] rounded-full opacity-60 z-0"></div>
          
          {/* Top Right Green Accent Blob */}
          <div className="absolute top-8 -right-8 w-24 h-32 bg-[#93c572] rounded-full opacity-70 transform rotate-12 z-0"></div>

          {/* Header Content */}
          <div className="absolute top-0 left-0 w-full h-full z-20 flex px-3 pt-3">
            {/* Logo Placeholder (Rose) */}
            <div className="w-[45px] h-[45px] bg-white/90 rounded-full flex items-center justify-center shadow-sm overflow-hidden border border-slate-200 flex-shrink-0 mt-1">
              <span className="text-red-500 text-2xl" role="img" aria-label="rose">🌹</span>
            </div>
            
            {/* School Name */}
            <div className="ml-2 flex flex-col justify-start pt-1">
              <h1 className="text-[20px] font-bold text-white font-serif leading-[1.1] tracking-wide text-shadow-sm">
                ROSE CONVENT
              </h1>
              <h2 className="text-[14px] font-bold text-white font-serif tracking-widest pl-2">
                HIGH SCHOOL
              </h2>
            </div>
          </div>

          {/* Student Identity Card Pill */}
          <div className="absolute bottom-[2px] left-0 w-full flex justify-center z-30">
            <div className="bg-[#f0f4f8] text-[#1a2b4c] text-[10px] font-bold uppercase tracking-widest px-4 py-[3px] rounded-full border border-slate-200 shadow-sm">
              Student Identity Card
            </div>
          </div>
        </div>

        {/* --- PHOTO SECTION --- */}
        <div className="mt-2 flex flex-col items-center relative z-10">
          <div className="w-[100px] h-[120px] border-[2px] border-slate-200 p-1 bg-white shadow-sm overflow-hidden rounded-sm">
            {/* Replace src with actual student photo URL */}
            <img 
              src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=200&h=240" 
              alt="Student" 
              className="w-full h-full object-cover rounded-sm grayscale-[20%]"
            />
          </div>
          <h3 className="mt-3 text-[14px] font-extrabold text-[#1f3bb3] uppercase tracking-wide font-serif">
            Ashmin Sagar Mourya
          </h3>
        </div>

        {/* --- DETAILS SECTION --- */}
        <div className="px-5 mt-4 space-y-[6px] relative z-10 font-sans">
          
          <div className="flex text-[12px]">
            <div className="w-[90px] text-slate-800 tracking-wide">Father's Name</div>
            <div className="w-[10px] text-slate-800 font-bold">:</div>
            <div className="flex-1 font-bold text-slate-900 uppercase">Amit Kumar Mourya</div>
          </div>

          <div className="flex text-[12px]">
            <div className="w-[90px] text-slate-800 tracking-wide">Class/Sec.</div>
            <div className="w-[10px] text-slate-800 font-bold">:</div>
            <div className="flex-1 font-bold text-slate-900 uppercase">9TH</div>
          </div>

          <div className="flex text-[12px]">
            <div className="w-[90px] text-slate-800 tracking-wide">Mob.No.</div>
            <div className="w-[10px] text-slate-800 font-bold">:</div>
            <div className="flex-1 font-bold text-slate-900 uppercase">9589389295</div>
          </div>

          <div className="flex text-[12px]">
            <div className="w-[90px] text-slate-800 tracking-wide">Address</div>
            <div className="w-[10px] text-slate-800 font-bold">:</div>
            <div className="flex-1 font-bold text-slate-900 uppercase leading-[1.2]">Tikuriya Tola</div>
          </div>

        </div>

        {/* --- FOOTER & SIGNATURE --- */}
        <div className="absolute bottom-0 left-0 w-full">
          
          {/* Signature Option Area */}
          <div className="flex justify-end pr-6 pb-2">
            <div className="text-center relative">
              {/* Green Squiggly Signature Simulation */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-8 text-green-700 opacity-80 pointer-events-none p-5">

                
              </div>
              
              <div className="text-[12px] font-extrabold text-[#1a2b4c] border-t-[1.5px] border-[#1a2b4c] pt-[1px] px-2 w-[80px]">
                Principal
              </div>
            </div>
          </div>

          {/* Bottom Dark Blue Band */}
          <div className="bg-[#1a2b4c] text-white text-center py-2 px-1">
            <p className="text-[14px] font-black tracking-widest uppercase font-serif text-shadow-sm">
              Tikuriyatola, Satna
            </p>
          </div>
        </div>

      </Card>
      

    </div>
  );
}