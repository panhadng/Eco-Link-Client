'use client';

import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = createContext<SelectContextType | undefined>(undefined);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select components must be used within a Select');
  }
  return context;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, onValueChange, children, disabled }: SelectProps) {
  const [open, setOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div ref={selectRef} className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function SelectTrigger({ children, className, disabled }: SelectTriggerProps) {
  const { open, setOpen } = useSelectContext();

  return (
    <button
      type="button"
      onClick={() => !disabled && setOpen(!open)}
      disabled={disabled}
      className={cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <span className="truncate flex-1 text-left">{children}</span>
      <ChevronDownIcon
        className={cn(
          'h-4 w-4 text-gray-500 transition-transform duration-200 ml-2 flex-shrink-0',
          open && 'rotate-180',
          disabled && 'opacity-50'
        )}
      />
    </button>
  );
}

export function SelectValue({ placeholder, children }: { placeholder?: string; children?: React.ReactNode }) {
  const { value } = useSelectContext();
  if (children) {
    return <>{children}</>;
  }
  return <span>{value || placeholder || 'Select...'}</span>;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SelectContent({ children, className }: SelectContentProps) {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div
        className={cn(
          'absolute z-50 mt-1 max-h-[300px] w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg',
          className
        )}
      >
        {children}
      </div>
    </>
  );
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

export function SelectItem({ value, children, className }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
        isSelected && 'bg-primary/10 text-primary',
        className
      )}
    >
      {children}
    </div>
  );
}

