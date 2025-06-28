import React from 'react'

interface IconProps {
  className?: string
}

export const DaggerIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 2l3 3-3 3-3-3 3-3z" />
    <path d="M12 8v14" />
    <path d="M8 10l4 4 4-4" />
  </svg>
)

export const ShieldIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
)

export const SwordIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
    <path d="M13 19l6-6" />
    <path d="M16 16l4 4" />
    <path d="M19 21l2-2" />
  </svg>
)

export const FanIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <path d="M12 22V12" />
    <path d="M12 12L4 4" />
    <path d="M12 12l8-8" />
  </svg>
)

export const StaffIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M12 2v20" />
    <path d="M8 5h8" />
    <path d="M8 19h8" />
  </svg>
)

export const QuillIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M20 2c0 0-3 6-10 6S2 8 2 8" />
    <path d="M2 8v14h20V8" />
    <path d="M2 12h20" />
    <path d="M2 16h20" />
  </svg>
)

export const CurseIcon: React.FC<IconProps> = ({ className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={`w-6 h-6 ${className}`}
  >
    <path d="M10 2h4v4h-4z" />
    <path d="M4 18V6a4 4 0 0 1 4-4" />
    <path d="M20 6v12a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4" />
    <path d="M15 22v-4a3 3 0 0 0-3-3v0a3 3 0 0 0-3 3v4" />
  </svg>
)