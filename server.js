const express = require('express');
const path = require('path');
const fs = require('fs/promises');
const { marked } = require('marked');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Content directory path
const CONTENT_DIR = path.join(__dirname, 'src/content');
const ROOT_TEMPLATE_PATH = path.join(__dirname, 'src/template.html');
const CONTENT_TEMPLATE_PATH = path.join(CONTENT_DIR, 'src/template.html');

// Helper function to read template file
async function getTemplate(contentPath) {
  try {
    // First check if there's a specific template for this content path
    const contentDir = path.dirname(contentPath);
    const specificTemplatePath = path.join(contentDir, 'template.html');
    
    try {
      await fs.access(specificTemplatePath);
      return await fs.readFile(specificTemplatePath, 'utf8');
    } catch (err) {
      // No specific template, try content folder template
      try {
        await fs.access(CONTENT_TEMPLATE_PATH);
        return await fs.readFile(CONTENT_TEMPLATE_PATH, 'utf8');
      } catch (err) {
        // Fall back to root template
        return await fs.readFile(ROOT_TEMPLATE_PATH, 'utf8');
      }
    }
  } catch (error) {
    console.error('Error reading template file:', error);
    throw new Error('Template file not found');
  }
}

// Helper function to find and read markdown content
async function getContent(contentPath) {
  // console.log("🚀 ~ getContent ~ contentPath:", contentPath)
  try {
    // Check if the path exists
    await fs.access(contentPath);
    
    // Check if it's a directory
    const stats = await fs.stat(contentPath);
    
    if (stats.isDirectory()) {
      // Look for index.md in the directory
      const indexPath = path.join(contentPath, 'index.md');
      try {
        const content = await fs.readFile(indexPath, 'utf8');
        return marked(content); // Convert markdown to HTML
      } catch (err) {
        throw new Error('No index.md found in directory');
      }
    } else {
      // If it's a file (should be .md)
      if (path.extname(contentPath) === '.md') {
        const content = await fs.readFile(contentPath, 'utf8');
        return marked(content); // Convert markdown to HTML
      } else {
        throw new Error('Not a markdown file');
      }
    }
  } catch (error) {
    console.error('Error reading content:', error);
    throw new Error('Content not found');
  }
}

// Function to render a page for a given path
async function renderPage(requestPath) {
  // Normalize path to prevent directory traversal
  requestPath = path.normalize(requestPath).replace(/^(\.\.(\/|\\|$))+/, '');
  // console.log("🚀 ~ renderPage ~ requestPath:", requestPath)
  
  // Create full path to content directory
  let contentPath = path.join(CONTENT_DIR, requestPath);
  // console.log("🚀 ~ renderPage ~ CONTENT_DIR:", CONTENT_DIR)
  // console.log("🚀 ~ renderPage ~ contentPath:", contentPath)
  
  // If path doesn't include .md extension and doesn't end with /, assume it's a directory
  if (!contentPath.endsWith('.md') && !contentPath.endsWith('/')) {
    contentPath = path.join(contentPath, 'index.md');
  }
  
  // If it's a directory path ending with /, add index.md
  if (contentPath.endsWith('/')) {
    contentPath = path.join(contentPath, 'index.md');
  }
  
  // Get template and content
  const htmlContent = await getContent(contentPath);
  // console.log("🚀 ~ renderPage ~ htmlContent:", htmlContent)
  const template = await getTemplate(contentPath);
  
  // Replace template placeholder with content
  return template.replace('{{content}}', htmlContent);
}

// // API endpoint to get content for a specific path
// app.get('/api/content/*', async (req, res) => {
//   try {
//     let requestPath = req.params[0] || '';
//     const fullHtml = await renderPage(requestPath);
    
//     // Explicitly set content type to application/json
//     // res.set('Content-Type', 'application/json');
//     // res.send(JSON.stringify({ 
//     //   html: fullHtml,
//     //   path: requestPath
//     // }));

//     // Ensure JSON response
//     res.json({ 
//       html: fullHtml,  // Still HTML, but inside a JSON object
//       path: requestPath
//     });
//   } catch (error) {
//     console.error('API content error:', error);
//     res.status(500).json({ error: error.message || 'Internal Server Error' });
//   }
// });

app.get('/api/content/*', async (req, res) => {
  try {
    let requestPath = req.params[0] || '';
    console.log("🚀 ~ app.get ~ req:", req)
    console.log("Fetching content for:", requestPath);

    const fullHtml = await renderPage(requestPath);
    // console.log("🚀 ~ API response content:", fullHtml);

    res.json({ 
      html: fullHtml,
      path: requestPath
    });
  } catch (error) {
    console.error('API content error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// API endpoint to get the content structure
app.get('/api/structure', async (req, res) => {
  try {
    const structure = await buildContentStructure(CONTENT_DIR);
    res.json(structure);
  } catch (error) {
    res.status(500).json({ error: 'Error getting content structure' });
  }
});

// Helper function to recursively build content structure
async function buildContentStructure(dirPath, basePath = '') {
  const items = await fs.readdir(dirPath, { withFileTypes: true });
  
  const structure = [];
  
  for (const item of items) {
    // Skip template.html files in navigation
    if (item.name === 'template.html') continue;
    
    const itemPath = path.join(dirPath, item.name);
    const relativePath = path.join(basePath, item.name);
    
    if (item.isDirectory()) {
      // It's a directory, recurse into it
      const children = await buildContentStructure(itemPath, relativePath);
      structure.push({
        type: 'directory',
        name: item.name,
        path: relativePath,
        children
      });
    } else if (item.name === 'index.md') {
      // It's an index markdown file
      structure.push({
        type: 'page',
        name: path.basename(basePath) || 'index',
        path: basePath || '/'
      });
    }
  }
  
  return structure;
}

app.post('/api/create-folder', async (req, res) => {
  const { folderName, parentPath } = req.body;

  if (!folderName) {
    return res.status(400).json({ error: 'Folder name is required' });
  }

  // Construct the new folder path
  const newFolderPath = path.join(CONTENT_DIR, parentPath || '', folderName);

  try {
    // Check if folder already exists
    await fs.access(newFolderPath).catch(() => fs.mkdir(newFolderPath, { recursive: true }));

    res.status(201).json({ message: 'Folder created successfully', path: `${parentPath}/${folderName}` });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({ error: 'Failed to create folder' });
  }
});

// IMPORTANT NEW PART: Serve compiled HTML for direct page requests
app.get('*', async (req, res, next) => {
  try {
    // Skip API routes
    if (req.path.startsWith('/api/')) {
      return next();
    }
    
    // Get the path from the URL
    let requestPath = req.path;
    if (requestPath === '/') requestPath = '';
    
    // Remove leading slash
    if (requestPath.startsWith('/')) {
      requestPath = requestPath.substring(1);
    }
    
    // Render the page
    const html = await renderPage(requestPath);
    res.send(html);
  } catch (error) {
    console.error('Error rendering page:', error);
    res.status(404).send(`
      <!DOCTYPE html>
      <html>
      <head><title>Page Not Found</title></head>
      <body>
        <h1>404 - Page Not Found</h1>
        <p>The page you requested could not be found.</p>
        <p><a href="/">Go to Home Page</a></p>
      </body>
      </html>
    `);
  }
});

// Serve React frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
}

// Handle React routing, return all requests to React app
app.get('*', function(req, res) {
  // Skip this for API routes
  if (req.path.startsWith('/api/')) {
    return;
  }
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing