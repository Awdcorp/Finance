// src/constants/categories.js

import {
  ShoppingCart,
  Utensils,
  Bus,
  Home,
  School,
  PiggyBank,
  Zap,
  Music,
  ShoppingBag,
  HeartPulse,
  Dumbbell,
  ScissorsSquare,
  Wallet,
  Briefcase,
  BarChart4,
  Gift,
  Baby,
  User,
  ShieldCheck,
  Plane,
  Sparkles,
  FileText,
  Fuel,
  Phone,
  TicketCheck,
  IndianRupee,
  ReceiptIndianRupee,
} from "lucide-react";

export const iconOptions = {
  ReceiptIndianRupee,
  ShoppingCart,
  Utensils,
  Bus,
  Home,
  School,
  PiggyBank,
  Zap,
  Music,
  ShoppingBag,
  HeartPulse,
  Dumbbell,
  ShieldCheck,
  Baby,
  Wallet,
  Briefcase,
  BarChart4,
  Gift,
  Sparkles,
  Fuel,
  Phone,
  FileText,
  User,
  Plane,
  ScissorsSquare,
  TicketCheck
}

export const categoryOptions = [
  "Rent",
  "Groceries",
  "Bills",
  "EMI",
  "Savings",
  "Transfer",
  "Travel",
  "Subscriptions",
  "Food",
  "Transport",
  "Education",
  "Shopping",
  "Entertainment",
  "Fitness",
  "Health",
  "Insurance",
  "Kids",
  "Salary",
  "Freelance",
  "Investment",
  "Gift",
  "parents",
  "Festivals",
  "Fuel",
  "personalCare",
  "Phone",
  "TicketCheck",
  "Miscellaneous"
]

export const categoryIcons = {
  rent: Home,
  groceries: ShoppingCart,
  bills: Zap,
  emi: ScissorsSquare,
  savings: PiggyBank,
  transfer: Wallet,
  travel: Plane,
  subscriptions: TicketCheck,
  food: Utensils,
  transport: Bus,
  education: School,
  shopping: ShoppingBag,
  entertainment: Music,
  fitness: Dumbbell,
  health: HeartPulse,
  insurance: ShieldCheck,
  kids: Baby,
  salary: Wallet,
  freelance: Briefcase,
  investment: BarChart4,
  gift: Gift,
  parents: User,
  festivals: Sparkles,
  fuel: Fuel,
  personalcare: ScissorsSquare,
  phone: Phone,
  ticketcheck: TicketCheck,
  miscellaneous: ReceiptIndianRupee,
  default: FileText
}

export const categoryColors = {
  rent: "bg-purple-500/20 text-purple-400",
  groceries: "bg-pink-500/20 text-pink-400",
  bills: "bg-red-500/20 text-red-400",
  emi: "bg-red-500/20 text-red-400",
  savings: "bg-green-500/20 text-green-400",
  transfer: "bg-indigo-500/20 text-indigo-400",
  travel: "bg-cyan-500/20 text-cyan-400",
  subscriptions: "bg-gray-500/20 text-gray-400",
  food: "bg-amber-500/20 text-amber-400",
  transport: "bg-blue-500/20 text-blue-400",
  education: "bg-teal-500/20 text-teal-400",
  shopping: "bg-rose-500/20 text-rose-400",
  entertainment: "bg-pink-400/20 text-pink-300",
  fitness: "bg-indigo-500/20 text-indigo-400",
  health: "bg-red-500/20 text-red-400",
  insurance: "bg-emerald-500/20 text-emerald-400",
  kids: "bg-orange-400/20 text-orange-300",
  salary: "bg-green-600/20 text-green-500",
  freelance: "bg-blue-600/20 text-blue-500",
  investment: "bg-purple-500/20 text-purple-400",
  gift: "bg-fuchsia-500/20 text-fuchsia-400",
  parents: "bg-gray-400/20 text-gray-300",
  festivals: "bg-violet-500/20 text-violet-400",
  fuel: "bg-yellow-500/20 text-yellow-400",
  personalcare: "bg-yellow-500/20 text-yellow-400",
  phone: "bg-blue-500/20 text-blue-400",
  ticketcheck: "bg-lime-500/20 text-lime-400",
  miscellaneous: "bg-red-500/20 text-red-400"
}

export const iconMap = {
  ReceiptIndianRupee: <ReceiptIndianRupee size={20} className="text-yellow-400" />, // Miscellaneous
  IndianRupee: <IndianRupee size={20} className="text-yellow-400" />, // Fallback

  ShoppingCart: <ShoppingCart size={20} className="text-pink-400" />, // Groceries
  Utensils: <Utensils size={20} className="text-amber-400" />, // Food
  Bus: <Bus size={20} className="text-blue-400" />, // Transport
  Home: <Home size={20} className="text-purple-400" />, // Rent
  School: <School size={20} className="text-teal-400" />, // Education
  PiggyBank: <PiggyBank size={20} className="text-green-400" />, // Savings
  Zap: <Zap size={20} className="text-red-400" />, // Bills
  FileText: <FileText size={20} className="text-gray-400" />, // Fallback

  Music: <Music size={20} className="text-pink-300" />, // Entertainment
  ShoppingBag: <ShoppingBag size={20} className="text-rose-400" />, // Shopping
  HeartPulse: <HeartPulse size={20} className="text-red-400" />, // Health
  Dumbbell: <Dumbbell size={20} className="text-indigo-400" />, // Fitness
  ShieldCheck: <ShieldCheck size={20} className="text-emerald-400" />, // Insurance
  Baby: <Baby size={20} className="text-orange-300" />, // Kids

  Wallet: <Wallet size={20} className="text-green-500" />, // Salary
  Briefcase: <Briefcase size={20} className="text-blue-500" />, // Freelance
  BarChart4: <BarChart4 size={20} className="text-purple-400" />, // Investment
  Gift: <Gift size={20} className="text-fuchsia-400" />, // Gift
  Sparkles: <Sparkles size={20} className="text-violet-400" />, // Festivals

  Fuel: <Fuel size={20} className="text-yellow-400" />, // Fuel
  Phone: <Phone size={20} className="text-blue-400" />, // Phone
  User: <User size={20} className="text-gray-300" />, // Parents
  Plane: <Plane size={20} className="text-cyan-400" />, // Travel
  ScissorsSquare: <ScissorsSquare size={20} className="text-yellow-400" />, // PersonalCare
  TicketCheck: <TicketCheck size={20} className="text-lime-400" />, // Subscriptions / Ticketing

  Miscellaneous: <ReceiptIndianRupee size={20} className="text-yellow-400" /> // Same as fallback
}
