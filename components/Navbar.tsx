"use client";

import {
  Search,
  Bell,
  Mail,
  Menu,
  ChevronDown,
  LogOut,
  User,
  Settings,
  GraduationCap,
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export function Navbar() {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20 border-b">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left side: Mobile Menu & Search */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="p-5 border-b flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-bold text-gray-800">EduPro</h1>
                  <p className="text-xs text-gray-500">v3.2.0 Enterprise</p>
                </div>
              </div>
              <nav className="flex-1 overflow-y-auto p-4 space-y-1 text-sm">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <LayoutDashboard className="w-5 h-5" /> Dashboard
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <Users className="w-5 h-5" /> Students
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <BookOpen className="w-5 h-5" /> Classes
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg text-gray-700 hover:bg-gray-100">
                  <Calendar className="w-5 h-5" /> Timetable
                </a>
              </nav>
            </SheetContent>
          </Sheet>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search students, teachers, classes..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* Right side: Actions & Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Button>

          {/* Messages */}
          <Button variant="ghost" size="icon" className="relative text-gray-600 hover:text-blue-600">
            <Mail className="h-5 w-5" />
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0 border-2 border-white">
              5
            </Badge>
          </Button>

          <Separator orientation="vertical" className="h-8 bg-gray-200 hidden md:block" />

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto py-1 px-2 gap-2 hover:bg-transparent">
                <Avatar className="w-9 h-9 ring-2 ring-blue-500">
                  <AvatarImage src="https://i.pravatar.cc/40?img=12" alt="Dr. Sarah Mitchell" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm font-semibold text-gray-800">Dr. Sarah Mitchell</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Dr. Sarah Mitchell</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    admin@edupro.com
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
