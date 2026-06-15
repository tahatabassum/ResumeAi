/**
 * Utility to format social and portfolio links for display and routing
 */

export interface FormattedLink {
  href: string;
  displayText: string;
}

export function formatGithub(input: string): FormattedLink {
  const cleanInput = input.trim();
  if (!cleanInput) return { href: '', displayText: '' };

  // If it's already a full URL or domain URL
  if (cleanInput.includes('github.com')) {
    // Add protocol if missing
    const href = cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`;
    // Strip protocol and www for display
    const displayText = cleanInput.replace(/^(https?:\/\/)?(www\.)?/, '');
    return { href, displayText };
  }

  // Otherwise treat as username
  return {
    href: `https://github.com/${cleanInput}`,
    displayText: `github.com/${cleanInput}`
  };
}

export function formatLinkedin(input: string): FormattedLink {
  const cleanInput = input.trim();
  if (!cleanInput) return { href: '', displayText: '' };

  if (cleanInput.includes('linkedin.com')) {
    const href = cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`;
    const displayText = cleanInput.replace(/^(https?:\/\/)?(www\.)?/, '');
    return { href, displayText };
  }

  return {
    href: `https://linkedin.com/in/${cleanInput}`,
    displayText: `linkedin.com/in/${cleanInput}`
  };
}

export function formatPortfolio(input: string): FormattedLink {
  const cleanInput = input.trim();
  if (!cleanInput) return { href: '', displayText: '' };

  const href = cleanInput.startsWith('http') ? cleanInput : `https://${cleanInput}`;
  const displayText = cleanInput.replace(/^(https?:\/\/)?(www\.)?/, '');
  return { href, displayText };
}
