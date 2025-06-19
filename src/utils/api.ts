// API configuration for OpenRouter
const API_CONFIG = {
  endpoint: 'https://openrouter.ai/api/v1/chat/completions',
  apiKey: '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',
  model: 'mistralai/mistral-7b-instruct',
  timeout: 30000,
};

// Backend configuration
const BACKEND_CONFIG = {
  baseURL: 'https://cyberai.rf.gd/backend',
};

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  files?: File[];
}

export const sendMessage = async (
  message: string, 
  isNormalMode: boolean = false, 
  contextMessages: Message[] = []
): Promise<string> => {
  try {
    // Enhanced system prompts with comprehensive knowledge base
    const cyberSecurityKnowledge = `
CYBERSECURITY EXPERTISE:
- Kali Linux tools: Nmap, Metasploit, Burp Suite, Wireshark, John the Ripper, Hashcat, Aircrack-ng, SQLmap, Nikto, Gobuster, Hydra, OWASP ZAP, Maltego, Recon-ng, Social Engineer Toolkit
- Penetration Testing: OWASP Top 10, PTES methodology, NIST frameworks, vulnerability assessment, exploit development, post-exploitation techniques
- Network Security: Firewall configuration, IDS/IPS, VPN setup, network segmentation, traffic analysis, packet capture analysis
- Web Security: SQL injection, XSS, CSRF, authentication bypass, session management, API security testing
- Wireless Security: WPA/WPA2/WPA3 cracking, evil twin attacks, deauth attacks, wireless reconnaissance
- Digital Forensics: Memory analysis, disk imaging, timeline analysis, artifact recovery, chain of custody
- Malware Analysis: Static/dynamic analysis, reverse engineering, sandbox analysis, IOC extraction
- Social Engineering: Phishing campaigns, pretexting, physical security testing, OSINT gathering
- Compliance: PCI DSS, HIPAA, SOX, GDPR, ISO 27001, NIST Cybersecurity Framework
- Incident Response: SANS methodology, containment strategies, evidence preservation, threat hunting
`;

    const generalKnowledge = `
COMPREHENSIVE KNOWLEDGE BASE:
- Programming: Python, JavaScript, Java, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, TypeScript, SQL, HTML/CSS, React, Node.js, Django, Flask, Spring, .NET
- Data Science & AI: Machine Learning, Deep Learning, Neural Networks, TensorFlow, PyTorch, Scikit-learn, Pandas, NumPy, Data Analysis, Statistics
- Cloud Computing: AWS, Azure, Google Cloud, Docker, Kubernetes, Serverless, Microservices, DevOps, CI/CD
- Databases: MySQL, PostgreSQL, MongoDB, Redis, Elasticsearch, Oracle, SQL Server
- Operating Systems: Linux, Windows, macOS, Unix, System Administration, Shell Scripting
- Networking: TCP/IP, DNS, DHCP, Routing, Switching, Load Balancing, CDN
- Mathematics: Calculus, Linear Algebra, Statistics, Discrete Mathematics, Algorithms, Data Structures
- Science: Physics, Chemistry, Biology, Computer Science, Engineering principles
- Business: Project Management, Agile, Scrum, Marketing, Finance, Economics, Strategy
- General Knowledge: History, Geography, Literature, Arts, Current Events, Philosophy, Psychology
`;

    const developerInfo = `DEVELOPER INFORMATION (ONLY mention when specifically asked about creator/developer/admin):
"I was developed by **Udit Narayan**, a skilled developer passionate about cybersecurity and AI. You can connect with him on Instagram: [@https.udit](https://instagram.com/https.udit). He created me to help users with their questions and provide helpful assistance."`;

    const systemMessage = isNormalMode 
      ? `You are an advanced AI assistant with comprehensive knowledge across all domains. You have access to extensive training data from leading AI systems and knowledge bases. Provide accurate, detailed, and helpful responses on any topic.

CAPABILITIES:
${generalKnowledge}

RESPONSE GUIDELINES:
- Be conversational, engaging, and professional
- Provide practical, actionable information
- Use examples and analogies when helpful
- Format responses clearly with proper structure
- Cite sources or methodologies when relevant
- Admit limitations when uncertain

${developerInfo}`
      : `You are CyberAI, an elite cybersecurity expert with comprehensive knowledge of all security domains. You combine the expertise of top penetration testers, security researchers, and digital forensics specialists.

EXPERTISE AREAS:
${cyberSecurityKnowledge}

ADVANCED CAPABILITIES:
- Real-world attack scenarios and defense strategies
- Latest CVEs and vulnerability research
- Advanced persistent threat (APT) analysis
- Zero-day exploit techniques and mitigations
- Threat intelligence and attribution
- Security architecture and design
- Compliance and risk management
- Incident response and crisis management

RESPONSE GUIDELINES:
- Always prioritize ethical and legal approaches
- Provide step-by-step technical guidance
- Include command examples and practical demonstrations
- Explain the "why" behind security concepts
- Reference industry standards and best practices
- Suggest multiple approaches when applicable
- Include risk assessments and mitigation strategies

${developerInfo}`;

    // Build conversation history for context
    const conversationMessages = [
      {
        role: 'system',
        content: systemMessage
      }
    ];

    // Add context messages (conversation history) - optimized for better context
    const relevantContext = contextMessages.slice(-8); // Last 8 messages for better context
    relevantContext.forEach(msg => {
      conversationMessages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    });

    // Add current message
    conversationMessages.push({
      role: 'user',
      content: message
    });

    const response = await fetch(API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_CONFIG.apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'CyberAI-Enhanced',
        'HTTP-Referer': 'https://cyberai.rf.gd'
      },
      body: JSON.stringify({
        model: API_CONFIG.model,
        messages: conversationMessages,
        max_tokens: 2000, // Increased for more detailed responses
        temperature: isNormalMode ? 0.7 : 0.6, // Slightly lower for more focused responses
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        // Enhanced parameters for better responses
        repetition_penalty: 1.1,
        top_k: 40
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || 'API request failed');
    }

    return data.choices?.[0]?.message?.content || 'Sorry, I encountered an error processing your request.';
  } catch (error) {
    console.error('API Error:', error);
    
    // Provide more specific error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    } else if (error instanceof Error && error.message.includes('HTTP error')) {
      throw new Error('AI service is temporarily unavailable. Please try again in a moment.');
    } else {
      throw new Error('An unexpected error occurred. Please try again.');
    }
  }
};

export const uploadImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      reject(new Error('File size too large. Please select a file smaller than 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve(base64);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file. Please try again.'));
    };
    reader.readAsDataURL(file);
  });
};

// Utility function to truncate text for context management
export const truncateText = (text: string, maxLength: number = 1000): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Utility function to estimate token count (rough approximation)
export const estimateTokenCount = (text: string): number => {
  // Rough approximation: 1 token ≈ 4 characters
  return Math.ceil(text.length / 4);
};

// Function to manage context window efficiently
export const optimizeContextMessages = (messages: Message[], maxTokens: number = 4000): Message[] => {
  let totalTokens = 0;
  const optimizedMessages: Message[] = [];
  
  // Start from the most recent messages and work backwards
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    const messageTokens = estimateTokenCount(message.content);
    
    if (totalTokens + messageTokens > maxTokens && optimizedMessages.length > 0) {
      break;
    }
    
    optimizedMessages.unshift(message);
    totalTokens += messageTokens;
  }
  
  return optimizedMessages;
};