interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  timestamp: Date;
}

export class WebSearchService {
  private static instance: WebSearchService;
  private apiKeys = {
    serpapi: 'your-serpapi-key',
    bing: 'your-bing-key',
    google: 'your-google-key'
  };

  static getInstance(): WebSearchService {
    if (!WebSearchService.instance) {
      WebSearchService.instance = new WebSearchService();
    }
    return WebSearchService.instance;
  }

  async search(query: string, options: {
    maxResults?: number;
    timeRange?: string;
    safeSearch?: boolean;
    sources?: string[];
  } = {}): Promise<SearchResult[]> {
    const { maxResults = 10, timeRange = 'all', safeSearch = true } = options;

    try {
      // Try multiple search providers for better results
      const results = await Promise.allSettled([
        this.searchWithDuckDuckGo(query, maxResults),
        this.searchWithBing(query, maxResults),
        this.searchWithGoogle(query, maxResults)
      ]);

      const allResults: SearchResult[] = [];
      
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          allResults.push(...result.value);
        }
      });

      // Remove duplicates and sort by relevance
      const uniqueResults = this.removeDuplicates(allResults);
      return uniqueResults.slice(0, maxResults);

    } catch (error) {
      console.error('Web search failed:', error);
      return [];
    }
  }

  private async searchWithDuckDuckGo(query: string, maxResults: number): Promise<SearchResult[]> {
    try {
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
      const data = await response.json();
      
      const results: SearchResult[] = [];
      
      if (data.RelatedTopics) {
        data.RelatedTopics.slice(0, maxResults).forEach((topic: any) => {
          if (topic.FirstURL && topic.Text) {
            results.push({
              title: topic.Text.split(' - ')[0] || 'DuckDuckGo Result',
              url: topic.FirstURL,
              snippet: topic.Text,
              source: 'DuckDuckGo',
              timestamp: new Date()
            });
          }
        });
      }

      return results;
    } catch (error) {
      console.error('DuckDuckGo search failed:', error);
      return [];
    }
  }

  private async searchWithBing(query: string, maxResults: number): Promise<SearchResult[]> {
    // Fallback search using a public API or scraping service
    try {
      const response = await fetch(`https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=${maxResults}`, {
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKeys.bing
        }
      });
      
      if (!response.ok) throw new Error('Bing API failed');
      
      const data = await response.json();
      
      return data.webPages?.value?.map((result: any) => ({
        title: result.name,
        url: result.url,
        snippet: result.snippet,
        source: 'Bing',
        timestamp: new Date()
      })) || [];
    } catch (error) {
      console.error('Bing search failed:', error);
      return [];
    }
  }

  private async searchWithGoogle(query: string, maxResults: number): Promise<SearchResult[]> {
    // Fallback to Google Custom Search API
    try {
      const response = await fetch(`https://www.googleapis.com/customsearch/v1?key=${this.apiKeys.google}&cx=your-cx&q=${encodeURIComponent(query)}&num=${maxResults}`);
      
      if (!response.ok) throw new Error('Google API failed');
      
      const data = await response.json();
      
      return data.items?.map((result: any) => ({
        title: result.title,
        url: result.link,
        snippet: result.snippet,
        source: 'Google',
        timestamp: new Date()
      })) || [];
    } catch (error) {
      console.error('Google search failed:', error);
      return [];
    }
  }

  private removeDuplicates(results: SearchResult[]): SearchResult[] {
    const seen = new Set();
    return results.filter(result => {
      const key = result.url.toLowerCase();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  async getNewsResults(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      // Use news-specific endpoints
      const newsQuery = `${query} news`;
      return await this.search(newsQuery, { maxResults, timeRange: 'week' });
    } catch (error) {
      console.error('News search failed:', error);
      return [];
    }
  }

  async getAcademicResults(query: string, maxResults: number = 5): Promise<SearchResult[]> {
    try {
      // Search academic sources
      const academicQuery = `${query} site:scholar.google.com OR site:arxiv.org OR site:pubmed.ncbi.nlm.nih.gov`;
      return await this.search(academicQuery, { maxResults });
    } catch (error) {
      console.error('Academic search failed:', error);
      return [];
    }
  }
}

export const webSearchService = WebSearchService.getInstance();