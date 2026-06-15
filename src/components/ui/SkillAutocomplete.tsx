import React, { useState, useEffect, useRef } from 'react';
import { skillSuggestionsList, SkillSuggestion } from '../../data/skillsSuggestions';
import { Search, Plus } from 'lucide-react';
import Input from './Input';

interface SkillAutocompleteProps {
  onSelectSkill: (skill: { name: string; category: 'technical' | 'soft' | 'tools' | 'design' | 'data' }) => void;
  placeholder?: string;
}

export default function SkillAutocomplete({
  onSelectSkill,
  placeholder = 'Start typing a skill (e.g. React, Figma)...',
}: SkillAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState<SkillSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.length < 1) {
      setFiltered([]);
      setIsOpen(false);
      return;
    }

    const matches = skillSuggestionsList
      .filter((skill) =>
        skill.name.toLowerCase().includes(inputValue.toLowerCase())
      )
      .slice(0, 8); // Max 8 suggestions

    setFiltered(matches);
    setIsOpen(true);
    setActiveIndex(0);
  }, [inputValue]);

  // Click outside listener helper
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % (filtered.length + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length + 1) % (filtered.length + 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex === filtered.length || filtered.length === 0) {
        // "Add custom skill" option selected
        handleSelectCustom();
      } else if (activeIndex >= 0 && activeIndex < filtered.length) {
        handleSelect(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (skill: SkillSuggestion) => {
    onSelectSkill({ name: skill.name, category: skill.category });
    setInputValue('');
    setIsOpen(false);
  };

  const handleSelectCustom = () => {
    if (!inputValue.trim()) return;
    onSelectSkill({ name: inputValue.trim(), category: 'technical' });
    setInputValue('');
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full text-left font-sans">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (inputValue.length >= 1) setIsOpen(true);
          }}
          className="pl-9 h-10 border border-[#e2e8f0] rounded-md focus:border-[#2563eb]"
        />
        <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-[#e2e8f0] rounded-lg shadow-xl overflow-hidden select-none">
          {filtered.map((skill, index) => (
            <div
              key={skill.name}
              onClick={() => handleSelect(skill)}
              onMouseEnter={() => setActiveIndex(index)}
              className={`flex justify-between items-center px-4 py-2.5 text-xs cursor-pointer ${
                activeIndex === index ? 'bg-[#f8fafc]' : 'bg-white'
              }`}
            >
              <span className="font-semibold text-[#0f172a]">{skill.name}</span>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#7c3aed] bg-[#f5f3ff] px-2 py-0.5 rounded border border-[#ddd6fe]">
                {skill.category}
              </span>
            </div>
          ))}

          {/* Add custom skill entry */}
          {inputValue.trim() && (
            <div
              onClick={handleSelectCustom}
              onMouseEnter={() => setActiveIndex(filtered.length)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs cursor-pointer border-t border-[#f1f5f9] font-medium text-[#2563eb] ${
                activeIndex === filtered.length ? 'bg-[#eff6ff]' : 'bg-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>
                Add <span className="font-bold">"{inputValue}"</span> as custom skill
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
