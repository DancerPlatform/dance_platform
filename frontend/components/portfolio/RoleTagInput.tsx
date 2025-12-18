'use client';

import { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RoleTagInputProps {
  label: string;
  roles: string[];
  onChange: (roles: string[]) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
}

export function RoleTagInput({
  label,
  roles,
  onChange,
  placeholder = "역할을 입력하고 쉼표(,)를 누르세요",
  id = "role-input",
  required = false
}: RoleTagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if comma was entered
    if (value.includes(',')) {
      const newRoles = value
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0 && !roles.includes(r));

      if (newRoles.length > 0) {
        onChange([...roles, ...newRoles]);
      }
      setInputValue('');
    } else {
      setInputValue(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace when input is empty to remove last tag
    if (e.key === 'Backspace' && inputValue === '' && roles.length > 0) {
      onChange(roles.slice(0, -1));
    }

    // Handle enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim() && !roles.includes(inputValue.trim())) {
        onChange([...roles, inputValue.trim()]);
        setInputValue('');
      }
    }
  };

  const removeRole = (roleToRemove: string) => {
    onChange(roles.filter(role => role !== roleToRemove));
  };

  return (
    <div>
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="mt-2">
        {/* Tags Display */}
        {roles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {roles.map((role, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-600/20 border border-green-600/50 rounded-full text-sm text-green-400"
              >
                <span>{role}</span>
                <button
                  type="button"
                  onClick={() => removeRole(role)}
                  className="hover:bg-green-600/30 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${role}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Field */}
        <Input
          id={id}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="bg-zinc-800 border-zinc-700"
          placeholder={placeholder}
        />
        <p className="text-xs text-gray-500 mt-1">
          쉼표(,)를 입력하거나 Enter 키를 눌러 역할을 추가하세요
        </p>
      </div>
    </div>
  );
}
