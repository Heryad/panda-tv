export interface Channel {
  id: string;
  cuid?: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgChno?: string;
}

export const parseM3U = (content: string): Channel[] => {
  const lines = content.split('\n');
  const channels: Channel[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF:')) {
      const infoLine = lines[i];
      const urlLine = lines[i + 1];
      
      if (urlLine && !urlLine.startsWith('#')) {
        // Extract CUID
        const cuidMatch = infoLine.match(/CUID="([^"]*)"/);
        const cuid = cuidMatch ? cuidMatch[1] : undefined;
        
        // Extract tvg-id
        const idMatch = infoLine.match(/tvg-id="([^"]*)"/);
        const id = idMatch ? idMatch[1] : cuid || `channel-${i}`;
        
        // Extract tvg-name
        const nameMatch = infoLine.match(/tvg-name="([^"]*)"/);
        const name = nameMatch ? nameMatch[1] : 'Unknown Channel';
        
        // Extract tvg-logo
        const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
        const logo = logoMatch ? logoMatch[1] : '/app_logo.png';
        
        // Extract group-title
        const groupMatch = infoLine.match(/group-title="([^"]*)"/);
        const group = groupMatch ? groupMatch[1] : 'Other';
        
        // Extract tvg-chno
        const chnoMatch = infoLine.match(/tvg-chno="([^"]*)"/);
        const tvgChno = chnoMatch ? chnoMatch[1] : undefined;
        
        channels.push({
          id,
          cuid,
          name,
          logo,
          group,
          url: urlLine.trim(),
          tvgChno,
        });
      }
    }
  }
  
  return channels;
};

export const getCategories = (channels: Channel[]): string[] => {
  const categories = new Set<string>();
  channels.forEach(channel => {
    if (channel.group) {
      categories.add(channel.group);
    }
  });
  return Array.from(categories).sort();
};
