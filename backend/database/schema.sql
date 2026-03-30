-- ============================================
-- AmitSolutionHub - Project Selling System DB
-- ============================================

CREATE DATABASE IF NOT EXISTS amitsolutionhub;
USE amitsolutionhub;

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  long_description TEXT,
  image_url VARCHAR(500),
  demo_url VARCHAR(500),
  category_id INT NOT NULL,
  price_project_only DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_with_source DECIMAL(10,2) NOT NULL DEFAULT 0,
  features JSON,
  tech_stack JSON,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Orders table (checkout submissions)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  payment_screenshot_url VARCHAR(500),
  purchase_type ENUM('project_only', 'project_with_source') NOT NULL DEFAULT 'project_only',
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'verified', 'delivered', 'rejected') NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT
);

-- Seed categories
INSERT INTO categories (name, slug, display_order) VALUES
  ('Basic', 'basic', 1),
  ('Medium', 'medium', 2),
  ('Premium', 'premium', 3)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Seed sample projects
INSERT INTO projects (title, slug, description, long_description, image_url, demo_url, category_id, price_project_only, price_with_source, features, tech_stack, is_featured) VALUES
(
  'Portfolio Website',
  'portfolio-website',
  'A modern, responsive portfolio website with dark mode and smooth animations.',
  'A fully responsive portfolio website built with React and Tailwind CSS. Features include dark mode toggle, smooth scroll animations, project showcase section, contact form integration, and SEO optimization. Perfect for developers, designers, and freelancers.',
  '/uploads/projects/portfolio.png',
  'https://demo.amitsolutionhub.com/portfolio',
  1,
  499.00,
  999.00,
  '["Responsive Design", "Dark Mode", "Contact Form", "SEO Optimized", "Smooth Animations"]',
  '["React", "Tailwind CSS", "Vite"]',
  TRUE
),
(
  'E-Commerce Dashboard',
  'ecommerce-dashboard',
  'Admin dashboard for managing products, orders, and customers.',
  'A comprehensive e-commerce admin dashboard with real-time analytics, product management, order tracking, customer management, and inventory control. Includes role-based authentication and data visualization charts.',
  '/uploads/projects/ecommerce-dashboard.png',
  'https://demo.amitsolutionhub.com/ecommerce',
  2,
  1499.00,
  2999.00,
  '["Real-time Analytics", "Product Management", "Order Tracking", "Customer Management", "Role-based Auth", "Charts & Graphs"]',
  '["React", "Node.js", "MySQL", "Chart.js", "Tailwind CSS"]',
  TRUE
),
(
  'Full Stack Blog Platform',
  'fullstack-blog-platform',
  'Complete blog platform with CMS, comments, and user authentication.',
  'A full-featured blog platform with a custom CMS, markdown editor, user authentication, comment system, categories, tags, search functionality, and social sharing. Built with a modern tech stack for optimal performance.',
  '/uploads/projects/blog-platform.png',
  'https://demo.amitsolutionhub.com/blog',
  3,
  2499.00,
  4999.00,
  '["Custom CMS", "Markdown Editor", "User Auth", "Comment System", "Search", "Social Sharing", "SEO Optimized"]',
  '["React", "Node.js", "Express", "MongoDB", "Tailwind CSS", "JWT"]',
  TRUE
),
(
  'Landing Page Builder',
  'landing-page-builder',
  'Drag and drop landing page builder with export functionality.',
  'An intuitive drag-and-drop landing page builder that allows users to create professional landing pages without coding. Includes pre-built templates, custom components, export to HTML, and responsive preview.',
  '/uploads/projects/landing-builder.png',
  'https://demo.amitsolutionhub.com/builder',
  1,
  799.00,
  1499.00,
  '["Drag & Drop", "Pre-built Templates", "Export HTML", "Responsive Preview", "Custom Components"]',
  '["React", "Tailwind CSS", "DnD Kit"]',
  FALSE
),
(
  'Task Management App',
  'task-management-app',
  'Kanban-style task management with team collaboration features.',
  'A Trello-like task management application with drag-and-drop Kanban boards, team collaboration, due dates, labels, file attachments, activity logs, and real-time updates via WebSocket.',
  '/uploads/projects/task-manager.png',
  'https://demo.amitsolutionhub.com/tasks',
  2,
  1299.00,
  2499.00,
  '["Kanban Board", "Team Collaboration", "Due Dates", "Labels", "File Attachments", "Real-time Updates"]',
  '["React", "Node.js", "Socket.io", "MongoDB", "Tailwind CSS"]',
  FALSE
),
(
  'SaaS Starter Kit',
  'saas-starter-kit',
  'Production-ready SaaS boilerplate with auth, billing, and multi-tenancy.',
  'A complete SaaS starter kit with user authentication, subscription billing via Stripe, multi-tenancy, admin panel, email notifications, and a fully responsive dashboard. Ready for production deployment.',
  '/uploads/projects/saas-starter.png',
  'https://demo.amitsolutionhub.com/saas',
  3,
  3999.00,
  7999.00,
  '["User Auth", "Stripe Billing", "Multi-tenancy", "Admin Panel", "Email Notifications", "Dashboard", "API Ready"]',
  '["Next.js", "Node.js", "PostgreSQL", "Stripe", "Tailwind CSS", "Prisma"]',
  TRUE
);
