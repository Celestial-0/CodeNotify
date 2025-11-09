'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContestSearchProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
}

export function ContestSearch({
  onSearch,
  placeholder = 'Search contests by name or description...',
  defaultValue = '',
  className,
}: ContestSearchProps) {
  const [query, setQuery] = useState(defaultValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSearch} className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-9 pr-20"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
        {query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-7 w-7 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Button type="submit" size="sm" className="h-7">
          Search
        </Button>
      </div>
    </form>
  );
}
