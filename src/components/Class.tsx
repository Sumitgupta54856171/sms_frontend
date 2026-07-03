import React, { useState } from "react";
import { Users, LayoutGrid, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { classes } from "./data/class";
import { GlowingEffect } from "@/components/ui/glowing-effect";

// Dummy data extracted from your original code

const classesData = classes;

export default function ClassGrid() {
  const [activeClass, setActiveClass] = useState(null);

  const toggleClass = (cls) => {
    setActiveClass(activeClass?.id === cls.id ? null : cls);
  };

  return (
    <div className="w-full font-sans p-6 bg-slate-50 min-h-screen">
      
      {/* Section Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-[#f9ca24] to-[#f0932b]" />
        <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase text-slate-900">
          Class Overview
        </h2>
      </div>

      {/* Grid Layout for Classes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classesData.map((cls) => {
          const isActive = activeClass?.id === cls.id;
          
          return (
            <Card
              key={cls.id}
              onClick={() => toggleClass(cls)}
              className={`relative overflow-hidden cursor-pointer transition-all duration-300 ease-in-out border-slate-200 bg-white rounded-xl
                ${isActive ? 'shadow-xl scale-[1.02]' : 'shadow-sm hover:shadow-md hover:-translate-y-1'}
              `}
              // We use inline style for dynamic custom hex borders
              style={{
                borderColor: isActive ? cls.color : undefined,
              }}
            >
              <GlowingEffect
                blur={10}
                inactiveZone={0.01}
                proximity={50}
                spread={30}
                variant="default"
                glow={true}
                className="rounded-xl"
                disabled={false}
                borderWidth={2}
              />
              {/* Top Custom Color Gradient Bar */}
              <div 
                className="absolute top-0 left-0 right-0 h-1.5 opacity-90"
                style={{ background: `linear-gradient(90deg, ${cls.color}, transparent)` }}
              />

              <CardHeader className="pb-3 pt-5">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl font-bold text-slate-800">
                    {cls.name}
                  </CardTitle>
                  
                  {/* Dynamic Custom Badge for Students */}
                  <Badge 
                    variant="secondary" 
                    className="gap-1.5 font-semibold text-xs py-1"
                    style={{ 
                      backgroundColor: `${cls.color}15`,
                      color: cls.color,
                      border: `1px solid ${cls.color}40`
                    }}
                  >
                    <Users className="h-3.5 w-3.5" />
                    {cls.students} Students
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                {/* Sections Badges using Shadcn Outline Badge */}
                <div className="flex flex-wrap gap-2">
                  {cls.sections.map((sec) => (
                    <Badge 
                      key={sec} 
                      variant="outline" 
                      className="text-slate-500 border-slate-200 font-medium bg-slate-50"
                    >
                      Section {sec}
                    </Badge>
                  ))}
                </div>
              </CardContent>

              {/* Expanded Details View */}
              {isActive && (
                <CardFooter className="flex-col items-start border-t border-slate-100 bg-slate-50/50 pt-4 mt-2">
                  
                  <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <LayoutGrid className="h-4 w-4" /> Total Sections
                    </span>
                    <span className="text-sm font-bold" style={{ color: cls.color }}>
                      {cls.sections.length}
                    </span>
                  </div>
                  
                  <div className="w-full flex justify-between items-center mb-5">
                    <span className="text-sm text-slate-500 flex items-center gap-1.5">
                      <Users className="h-4 w-4" /> Avg per Section
                    </span>
                    <span className="text-sm font-bold" style={{ color: cls.color }}>
                      {Math.round(cls.students / cls.sections.length)}
                    </span>
                  </div>

                  {/* Standard Anchor Tag for preview compatibility */}
                  <Button 
                    asChild 
                    className="w-full font-semibold tracking-wide transition-all hover:opacity-90"
                    style={{ backgroundColor: cls.color, color: "#fff" }}
                  >
                    <a href={`#studentlist-${cls.no}`}>
                      VIEW STUDENTS <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}