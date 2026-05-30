export const lastUpdated = 'May 30, 2026';

export const howItWorks = {
  title: 'How 3daide Works',
  intro: '3daide is designed as a local-first, privacy-respecting utility for engineers, designers, and makers.',
  sections: [
    {
      title: 'Step 1: Select or Drop Your File',
      body: 'Choose your 3D file (STL, STEP, STP, OBJ, PLY, GLB, 3MF).',
    },
    {
      title: 'Step 2: 100% Local Parsing',
      body: 'Our engine runs directly inside your web browser (using WebAssembly & WebGL). Your 3D model geometry is analyzed locally, instantly extracting dimensions, volume, surface area, and triangle counts. No file is uploaded to our servers during this stage.',
    },
    {
      title: 'Step 3: Convert & Quote',
      body: "Select your target format and download your clean, converted file. If you need 3D printing services, our system estimates a budget range based on your model's volume and surface area.",
    },
  ],
};

export const privacySecurity = {
  title: 'Privacy & Security First',
  intro: 'We understand that your 3D models represent valuable intellectual property. That is why we engineered 3daide with a security-first architecture.',
  sections: [
    {
      title: 'Local-First Processing',
      body: 'Unlike traditional converters, we do not upload your 3D files to a cloud server for parsing. All CAD analysis and STL rendering happen locally on your computer.',
    },
    {
      title: 'Automatic Server Destruction',
      body: 'For specific formats that require server-side compilation, files are transferred over secure SSL encryption and are automatically, permanently deleted from our servers within 24 hours. We do not keep any backups.',
    },
    {
      title: 'Non-AI Training Guarantee',
      body: 'We pledge that your uploaded 3D geometries, meshes, and metadata will never be used to train AI models or shared with third parties.',
    },
  ],
};

export const terms = {
  title: 'Terms of Service',
  sections: [
    {
      title: '1. Acceptance of Terms',
      body: 'By accessing and using 3daide.com ("the Service"), you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the Service.',
    },
    {
      title: '2. Description of Service',
      body: '3daide provides free online 3D model analysis, file format conversion, and cost-estimation tools. The Service is provided "as is" and "as available" without warranties of any kind.',
    },
    {
      title: '3. Intellectual Property & File Ownership',
      body: 'You retain full ownership and intellectual property rights to any files you process through the Service. 3daide does not claim any rights to your 3D models.',
    },
    {
      title: '4. Cost Estimations',
      body: 'Any price estimations provided by the Service are for reference only and do not constitute a binding commercial offer.',
    },
    {
      title: '5. Limitation of Liability',
      body: 'Under no circumstances shall 3daide be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Service, including but not limited to file corruption or data loss.',
    },
  ],
};

export const privacyPolicy = {
  title: 'Privacy Policy',
  sections: [
    {
      title: '1. Information We Collect',
      body: 'Analytical Data: We collect anonymous usage statistics (such as page views, conversion success rates) using privacy-friendly, cookie-less analytics to improve our tool. We do not collect personally identifiable information (PII). Your 3D files are processed locally in your browser. For files processed on our servers, they are encrypted in transit via SSL and deleted automatically within 24 hours.',
    },
    {
      title: '2. Cookies',
      body: 'We do not use advertising cookies. We may use local storage (LocalStorage) on your device solely to save your local conversion history for your convenience.',
    },
    {
      title: '3. Third-Party Services',
      body: 'If you use the AI DFM Expert, your text prompts (not your 3D files) are sent to secure LLM APIs (e.g., OpenAI). No personal data is shared.',
    },
    {
      title: '4. GDPR Compliance',
      body: 'Since we do not collect personal data, email addresses, or IP addresses on our servers, we respect and comply with GDPR privacy principles by design.',
    },
  ],
};
