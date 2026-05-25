// src/seed.js
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import User from './models/user.model.js'
import Course from './models/course.model.js'
import Section from './models/section.model.js'
import Lesson from './models/lesson.model.js'

dotenv.config()

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  await Lesson.deleteMany({})
  await Section.deleteMany({})
  await Course.deleteMany({})
  await User.deleteMany({})
  console.log('Cleared existing data')

  const password = await bcrypt.hash('password123', 10)

  const [alice, bob, carol] = await User.insertMany([
    {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password,
      role: 'instructor',
      bio: 'Full-stack developer with 10 years of experience building scalable web apps.',
      isActive: true,
    },
    {
      name: 'Bob Martinez',
      email: 'bob@example.com',
      password,
      role: 'instructor',
      bio: 'Data scientist and ML engineer. Previously at Google and Meta.',
      isActive: true,
    },
    {
      name: 'Carol White',
      email: 'carol@example.com',
      password,
      role: 'instructor',
      bio: 'UI/UX designer and frontend developer. Passionate about design systems.',
      isActive: true,
    },
  ])

  await User.create({
    name: 'Student Demo',
    email: 'student@example.com',
    password,
    role: 'student',
    isActive: true,
  })

  console.log('Created users')

  // ── Helper to create sections + lessons ─────────────────────────────────
  const createCurriculum = async (courseId, sectionsData) => {
    const sectionIds = []

    for (const [sIndex, sectionData] of sectionsData.entries()) {
      const section = await Section.create({
        title: sectionData.title,
        description: sectionData.description,
        course: courseId,
        order: sIndex + 1,
      })

      const lessonIds = []
      for (const [lIndex, lessonData] of sectionData.lessons.entries()) {
        const lesson = await Lesson.create({
          title: lessonData.title,
          description: lessonData.description,
          section: section._id,
          course: courseId,
          order: lIndex + 1,
          isPreview: lIndex === 0, 
          duration: lessonData.duration ?? 0,
        })
        lessonIds.push(lesson._id)
      }

      section.lessons = lessonIds
      await section.save()
      sectionIds.push(section._id)
    }

    return sectionIds
  }

  const coursesData = [
    {
      title: 'Complete React Developer Bootcamp',
      description: 'Master React 18 from scratch. Build real-world projects using hooks, context, Redux Toolkit, React Query, and more. This course takes you from zero to production-ready React developer.',
      instructor: alice._id,
      category: 'Web Development',
      level: 'Beginner',
      price: 84.99,
      requirements: [
        'Basic HTML and CSS knowledge',
        'Fundamental JavaScript (variables, functions, arrays)',
        'No React experience needed',
      ],
      objectives: [
        'Build complex React applications from scratch',
        'Master React Hooks (useState, useEffect, useContext)',
        'Manage state with Redux Toolkit',
        'Fetch data with React Query / TanStack Query',
        'Deploy React apps to production',
        'Write clean, maintainable component architecture',
      ],
      tags: ['react', 'javascript', 'frontend', 'hooks'],
      sections: [
        {
          title: 'Getting Started with React',
          description: 'Setup and core concepts',
          lessons: [
            { title: 'Course Introduction & What You Will Build', description: 'Overview of the course and final project walkthrough', duration: 8 },
            { title: 'Setting Up Your Development Environment', description: 'Install Node.js, VS Code, and create your first Vite project', duration: 12 },
            { title: 'Understanding JSX', description: 'What JSX is and how Babel transforms it', duration: 15 },
            { title: 'Your First Component', description: 'Creating functional components and rendering them', duration: 18 },
          ],
        },
        {
          title: 'React Hooks Deep Dive',
          description: 'Master all the essential hooks',
          lessons: [
            { title: 'useState — Managing Local State', description: 'State basics, arrays, objects, and common pitfalls', duration: 22 },
            { title: 'useEffect — Side Effects in React', description: 'Fetching data, subscriptions, cleanup functions', duration: 25 },
            { title: 'useContext — Avoiding Prop Drilling', description: 'Creating and consuming context across the component tree', duration: 20 },
            { title: 'useReducer — Complex State Logic', description: 'When and why to use useReducer over useState', duration: 18 },
            { title: 'Custom Hooks — Reusing Logic', description: 'Building your own hooks for reusable stateful logic', duration: 24 },
          ],
        },
        {
          title: 'State Management with Redux Toolkit',
          description: 'Professional state management',
          lessons: [
            { title: 'Why Redux? The Problem It Solves', description: 'Understanding global state and when local state is not enough', duration: 14 },
            { title: 'Setting Up Redux Toolkit', description: 'Store, slices, and reducers', duration: 20 },
            { title: 'Async Thunks and API Calls', description: 'Fetching data and handling loading/error states in Redux', duration: 26 },
          ],
        },
        {
          title: 'Building & Deploying',
          description: 'Production-ready React apps',
          lessons: [
            { title: 'React Router v6 — Client-Side Routing', description: 'Routes, nested routes, params, and navigation', duration: 22 },
            { title: 'Performance Optimization', description: 'React.memo, useMemo, useCallback, and lazy loading', duration: 20 },
            { title: 'Deploying to Vercel', description: 'Build and deploy your React app in minutes', duration: 15 },
          ],
        },
      ],
    },

    {
      title: 'Node.js & Express Backend Masterclass',
      description: 'Build production-grade REST APIs with Node.js, Express, and MongoDB. Covers authentication, file uploads, email, payments, and deployment to AWS.',
      instructor: alice._id,
      category: 'Web Development',
      level: 'Intermediate',
      price: 94.99,
      requirements: [
        'Solid JavaScript fundamentals',
        'Basic understanding of how the web works (HTTP, requests)',
        'Some experience with any programming language',
      ],
      objectives: [
        'Build REST APIs from scratch with Express',
        'Design and model MongoDB databases with Mongoose',
        'Implement JWT authentication and role-based authorization',
        'Handle file uploads with Multer and Cloudinary',
        'Write middleware, error handlers, and validators',
        'Deploy Node.js apps to AWS EC2',
      ],
      tags: ['nodejs', 'express', 'mongodb', 'backend', 'api'],
      sections: [
        {
          title: 'Node.js Fundamentals',
          description: 'Core Node.js concepts',
          lessons: [
            { title: 'How Node.js Works — Event Loop Explained', description: 'Non-blocking I/O, the event loop, and the call stack', duration: 20 },
            { title: 'Modules — CommonJS vs ES Modules', description: 'require vs import/export and when to use each', duration: 15 },
            { title: 'Working with the File System', description: 'Reading, writing, and streaming files with the fs module', duration: 18 },
            { title: 'Building an HTTP Server from Scratch', description: 'Using the http module before introducing Express', duration: 16 },
          ],
        },
        {
          title: 'Express.js In Depth',
          description: 'Production Express patterns',
          lessons: [
            { title: 'Express Setup and Project Structure', description: 'Organizing a scalable Express app', duration: 14 },
            { title: 'Routing — RESTful API Design', description: 'CRUD routes, params, query strings, and best practices', duration: 22 },
            { title: 'Middleware — How It Really Works', description: 'Built-in, third-party, and custom middleware', duration: 20 },
            { title: 'Error Handling Done Right', description: 'Centralized error handler, operational vs programming errors', duration: 18 },
          ],
        },
        {
          title: 'MongoDB & Mongoose',
          description: 'Database design and querying',
          lessons: [
            { title: 'MongoDB Data Modeling', description: 'Embedding vs referencing and schema design patterns', duration: 24 },
            { title: 'Mongoose Models, Schemas, and Virtuals', description: 'Defining schemas with validation, hooks, and virtuals', duration: 22 },
            { title: 'Advanced Querying and Aggregation', description: '$match, $group, $lookup, and building analytics pipelines', duration: 28 },
          ],
        },
        {
          title: 'Authentication & Security',
          description: 'JWT, bcrypt, and security best practices',
          lessons: [
            { title: 'Password Hashing with bcryptjs', description: 'Why plain text passwords are dangerous and how bcrypt fixes it', duration: 16 },
            { title: 'JWT Access & Refresh Tokens', description: 'Issuing, verifying, and refreshing JWTs securely', duration: 25 },
            { title: 'Role-Based Authorization', description: 'Protecting routes based on user roles with middleware', duration: 18 },
            { title: 'Security Best Practices', description: 'helmet, cors, rate limiting, and input sanitization', duration: 20 },
          ],
        },
      ],
    },

    {
      title: 'Python for Data Science & Machine Learning',
      description: 'From Python basics to training ML models. Covers NumPy, Pandas, Matplotlib, Scikit-learn, and an introduction to neural networks with TensorFlow.',
      instructor: bob._id,
      category: 'Data Science',
      level: 'Beginner',
      price: 79.99,
      requirements: [
        'No programming experience required',
        'Basic high school math (algebra)',
        'A computer with internet access',
      ],
      objectives: [
        'Write Python code confidently from scratch',
        'Manipulate data with NumPy and Pandas',
        'Visualize data with Matplotlib and Seaborn',
        'Build ML models with Scikit-learn',
        'Understand regression, classification, and clustering',
        'Train your first neural network with TensorFlow',
      ],
      tags: ['python', 'data science', 'machine learning', 'pandas', 'scikit-learn'],
      sections: [
        {
          title: 'Python Fundamentals',
          description: 'Core Python from scratch',
          lessons: [
            { title: 'Why Python for Data Science?', description: 'The Python ecosystem and why it dominates data work', duration: 10 },
            { title: 'Variables, Data Types, and Operators', description: 'Integers, floats, strings, booleans, and type conversion', duration: 20 },
            { title: 'Lists, Tuples, and Dictionaries', description: 'Core data structures and when to use each', duration: 25 },
            { title: 'Functions and Scope', description: 'Defining functions, parameters, return values, and closures', duration: 22 },
            { title: 'File I/O and Error Handling', description: 'Reading CSV files and handling exceptions gracefully', duration: 18 },
          ],
        },
        {
          title: 'Data Analysis with Pandas',
          description: 'The most important data tool in Python',
          lessons: [
            { title: 'DataFrames and Series', description: 'Creating and inspecting DataFrames from CSVs and dicts', duration: 24 },
            { title: 'Filtering, Sorting, and Grouping', description: 'Boolean indexing, sort_values, and groupby', duration: 26 },
            { title: 'Handling Missing Data', description: 'dropna, fillna, and imputation strategies', duration: 20 },
            { title: 'Merging and Joining DataFrames', description: 'merge, join, concat — SQL-style operations in Pandas', duration: 22 },
          ],
        },
        {
          title: 'Machine Learning with Scikit-learn',
          description: 'Your first real ML models',
          lessons: [
            { title: 'The ML Workflow — Train, Validate, Test', description: 'Splitting data, overfitting, and the bias-variance tradeoff', duration: 22 },
            { title: 'Linear Regression from Scratch', description: 'Fitting a line to data and understanding coefficients', duration: 28 },
            { title: 'Classification with Logistic Regression', description: 'Binary classification and the sigmoid function', duration: 25 },
            { title: 'Decision Trees and Random Forests', description: 'Ensemble methods and feature importance', duration: 30 },
            { title: 'Model Evaluation — Accuracy, Precision, Recall', description: 'Confusion matrices, ROC curves, and cross-validation', duration: 26 },
          ],
        },
      ],
    },

    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn the principles of great design. Covers user research, wireframing, prototyping in Figma, design systems, and handing off to developers.',
      instructor: carol._id,
      category: 'Design',
      level: 'Beginner',
      price: 69.99,
      requirements: [
        'No design experience needed',
        'A free Figma account (we will set it up together)',
        'Curiosity and willingness to give and receive feedback',
      ],
      objectives: [
        'Understand core UX research methods',
        'Create wireframes and low-fidelity prototypes',
        'Design high-fidelity mockups in Figma',
        'Build and use a design system',
        'Conduct usability testing',
        'Hand off designs to developers professionally',
      ],
      tags: ['ux', 'ui', 'figma', 'design', 'prototype'],
      sections: [
        {
          title: 'Design Thinking & UX Research',
          description: 'Understand users before designing',
          lessons: [
            { title: 'What is UX Design?', description: 'The difference between UX and UI and why both matter', duration: 12 },
            { title: 'User Research Methods', description: 'Interviews, surveys, and contextual inquiry', duration: 20 },
            { title: 'Creating User Personas', description: 'Synthesizing research into actionable personas', duration: 18 },
            { title: 'User Journey Mapping', description: 'Mapping the end-to-end experience of your users', duration: 22 },
          ],
        },
        {
          title: 'Wireframing & Prototyping',
          description: 'From ideas to testable prototypes',
          lessons: [
            { title: 'Sketching and Paper Wireframes', description: 'Why low-fidelity is your best friend early on', duration: 16 },
            { title: 'Digital Wireframes in Figma', description: 'Setting up Figma and building your first wireframe', duration: 25 },
            { title: 'Interactive Prototypes', description: 'Connecting frames and creating realistic user flows', duration: 22 },
            { title: 'Usability Testing Your Prototype', description: 'Running tests, gathering feedback, and iterating', duration: 20 },
          ],
        },
        {
          title: 'Visual Design & Design Systems',
          description: 'Make it beautiful and consistent',
          lessons: [
            { title: 'Typography — Choosing and Pairing Fonts', description: 'Type scales, hierarchy, and readability', duration: 18 },
            { title: 'Color Theory for UI Designers', description: 'Color psychology, contrast, and accessibility (WCAG)', duration: 20 },
            { title: 'Building a Design System in Figma', description: 'Components, variants, and auto-layout', duration: 30 },
            { title: 'Developer Handoff with Figma', description: 'Inspect panel, annotations, and exporting assets', duration: 18 },
          ],
        },
      ],
    },

    {
      title: 'AWS Cloud Practitioner — Zero to Certified',
      description: 'Pass the AWS Certified Cloud Practitioner exam on your first try. Covers all exam domains: cloud concepts, core services, security, pricing, and support.',
      instructor: bob._id,
      category: 'IT & Software',
      level: 'Beginner',
      price: 74.99,
      requirements: [
        'No cloud or AWS experience required',
        'Basic computer literacy',
        'Motivation to get certified',
      ],
      objectives: [
        'Understand core AWS services (EC2, S3, RDS, Lambda)',
        'Explain the AWS shared responsibility model',
        'Understand AWS pricing, billing, and cost management',
        'Know AWS security and compliance services',
        'Pass the AWS Certified Cloud Practitioner exam',
      ],
      tags: ['aws', 'cloud', 'certification', 'devops'],
      sections: [
        {
          title: 'Cloud Fundamentals',
          description: 'What is cloud computing?',
          lessons: [
            { title: 'What is Cloud Computing?', description: 'On-premise vs cloud and the benefits of moving to AWS', duration: 15 },
            { title: 'AWS Global Infrastructure', description: 'Regions, Availability Zones, and Edge Locations', duration: 18 },
            { title: 'AWS Free Tier — What You Can Use for Free', description: 'Setting up your AWS account safely without surprise bills', duration: 14 },
          ],
        },
        {
          title: 'Core AWS Services',
          description: 'The services that appear on every exam',
          lessons: [
            { title: 'EC2 — Virtual Servers in the Cloud', description: 'Instance types, pricing models, and security groups', duration: 25 },
            { title: 'S3 — Object Storage', description: 'Buckets, objects, versioning, and storage classes', duration: 22 },
            { title: 'RDS — Managed Relational Databases', description: 'Multi-AZ, read replicas, and supported engines', duration: 20 },
            { title: 'Lambda — Serverless Computing', description: 'Function as a Service, triggers, and pricing', duration: 18 },
            { title: 'VPC — Your Private Network in AWS', description: 'Subnets, route tables, and internet gateways', duration: 24 },
          ],
        },
        {
          title: 'Security & Compliance',
          description: 'The shared responsibility model',
          lessons: [
            { title: 'IAM — Identity and Access Management', description: 'Users, groups, roles, and policies', duration: 22 },
            { title: 'AWS Shared Responsibility Model', description: 'What AWS secures vs what you secure', duration: 16 },
            { title: 'AWS Compliance Programs', description: 'SOC, PCI DSS, HIPAA, and how AWS helps you comply', duration: 14 },
          ],
        },
        {
          title: 'Exam Preparation',
          description: 'Pass on your first try',
          lessons: [
            { title: 'Exam Format and Question Types', description: 'Multiple choice, multiple response, and time management', duration: 12 },
            { title: 'Practice Exam Walkthrough', description: 'Going through 65 practice questions with explanations', duration: 45 },
            { title: 'Last-Minute Tips and Common Mistakes', description: 'What trips people up and how to avoid it', duration: 15 },
          ],
        },
      ],
    },

    {
      title: 'Tailwind CSS & Modern Frontend Development',
      description: 'Build beautiful, responsive UIs fast with Tailwind CSS. Covers utility-first CSS, responsive design, dark mode, animations, and building a component library.',
      instructor: carol._id,
      category: 'Web Development',
      level: 'Intermediate',
      price: 59.99,
      requirements: [
        'HTML and CSS fundamentals',
        'Basic JavaScript',
        'Familiarity with any frontend framework is a plus',
      ],
      objectives: [
        'Understand the utility-first CSS philosophy',
        'Build responsive layouts with Tailwind',
        'Implement dark mode and custom themes',
        'Create smooth animations and transitions',
        'Build a reusable component library',
        'Integrate Tailwind with React and Vite',
      ],
      tags: ['tailwind', 'css', 'frontend', 'responsive', 'design'],
      sections: [
        {
          title: 'Tailwind CSS Foundations',
          description: 'Core concepts and setup',
          lessons: [
            { title: 'Utility-First CSS — A Different Way to Think', description: 'Why utility classes beat traditional CSS for most projects', duration: 14 },
            { title: 'Setting Up Tailwind with Vite and React', description: 'Installation, configuration, and first styles', duration: 16 },
            { title: 'Typography and Color System', description: 'Text utilities, color palette, and customizing your theme', duration: 20 },
            { title: 'Spacing, Sizing, and Layout', description: 'Padding, margin, width, height, and the box model in Tailwind', duration: 18 },
          ],
        },
        {
          title: 'Responsive Design',
          description: 'Mobile-first layouts',
          lessons: [
            { title: 'Breakpoints and Responsive Modifiers', description: 'sm, md, lg, xl, 2xl and how to think mobile-first', duration: 20 },
            { title: 'Flexbox Utilities', description: 'flex, justify, items, gap, and building nav bars', duration: 22 },
            { title: 'Grid Utilities', description: 'grid-cols, span, auto-flow for complex layouts', duration: 20 },
            { title: 'Building a Responsive Landing Page', description: 'Full project: hero, features, pricing, footer', duration: 35 },
          ],
        },
        {
          title: 'Advanced Tailwind',
          description: 'Dark mode, animations, and components',
          lessons: [
            { title: 'Dark Mode with Tailwind', description: 'Class strategy vs media strategy and building a toggle', duration: 18 },
            { title: 'Animations and Transitions', description: 'transition, duration, ease, animate utilities', duration: 20 },
            { title: 'Building a Component Library', description: 'Extracting reusable components with @apply and variants', duration: 28 },
          ],
        },
      ],
    },

    {
      title: 'Digital Marketing Masterclass',
      description: 'A complete guide to modern digital marketing. Covers SEO, Google Ads, social media marketing, email marketing, content strategy, and analytics.',
      instructor: bob._id,
      category: 'Marketing',
      level: 'Beginner',
      price: 0,
      requirements: [
        'No marketing experience needed',
        'A business or project you want to grow (optional but helpful)',
      ],
      objectives: [
        'Build a complete digital marketing strategy',
        'Rank higher on Google with SEO',
        'Run profitable Google and Meta ad campaigns',
        'Grow an engaged social media following',
        'Build and monetize an email list',
        'Measure everything with Google Analytics 4',
      ],
      tags: ['marketing', 'seo', 'google ads', 'social media', 'email marketing'],
      sections: [
        {
          title: 'Marketing Strategy',
          description: 'Think before you post',
          lessons: [
            { title: 'The Digital Marketing Landscape in 2025', description: 'Channels, tools, and where to focus your energy', duration: 16 },
            { title: 'Defining Your Target Audience', description: 'Building buyer personas and understanding intent', duration: 20 },
            { title: 'Setting SMART Marketing Goals', description: 'KPIs, metrics, and connecting activity to revenue', duration: 15 },
          ],
        },
        {
          title: 'SEO — Search Engine Optimization',
          description: 'Get found on Google for free',
          lessons: [
            { title: 'How Google Search Works', description: 'Crawling, indexing, and ranking explained simply', duration: 18 },
            { title: 'Keyword Research', description: 'Finding low-competition, high-intent keywords with free tools', duration: 24 },
            { title: 'On-Page SEO', description: 'Title tags, meta descriptions, headers, and internal linking', duration: 22 },
            { title: 'Link Building Basics', description: 'Getting other websites to link to yours legitimately', duration: 20 },
          ],
        },
        {
          title: 'Paid Advertising',
          description: 'Google Ads and Meta Ads',
          lessons: [
            { title: 'Google Search Ads — Your First Campaign', description: 'Keywords, match types, ad copy, and bidding', duration: 28 },
            { title: 'Meta Ads — Facebook and Instagram', description: 'Audience targeting, creatives, and campaign objectives', duration: 26 },
            { title: 'Reading Ad Analytics', description: 'CTR, CPC, ROAS, and optimizing for profit', duration: 20 },
          ],
        },
      ],
    },

    {
      title: 'TypeScript for JavaScript Developers',
      description: 'Add type safety to your JavaScript projects. Covers TypeScript fundamentals, advanced types, generics, decorators, and integrating TS with React and Node.',
      instructor: alice._id,
      category: 'Web Development',
      level: 'Intermediate',
      price: 64.99,
      requirements: [
        'Solid JavaScript knowledge (ES6+)',
        'Experience with at least one JS framework',
        'Basic understanding of OOP concepts',
      ],
      objectives: [
        'Understand why TypeScript exists and when to use it',
        'Write strongly typed JavaScript with confidence',
        'Use generics to write reusable, type-safe code',
        'Integrate TypeScript with React and Express',
        'Configure tsconfig.json for any project',
        'Migrate a JavaScript project to TypeScript',
      ],
      tags: ['typescript', 'javascript', 'frontend', 'backend'],
      sections: [
        {
          title: 'TypeScript Basics',
          description: 'From JS to TS',
          lessons: [
            { title: 'Why TypeScript? The Problems It Solves', description: 'Runtime errors vs compile-time errors', duration: 14 },
            { title: 'Types, Interfaces, and Type Aliases', description: 'Primitive types, object shapes, and when to use interface vs type', duration: 22 },
            { title: 'Arrays, Tuples, and Enums', description: 'Typed collections and fixed-length arrays', duration: 18 },
            { title: 'Functions — Parameters, Return Types, Overloads', description: 'Typing every part of a function signature', duration: 20 },
          ],
        },
        {
          title: 'Advanced TypeScript',
          description: 'Power features',
          lessons: [
            { title: 'Generics — Writing Reusable Type-Safe Code', description: 'Generic functions, interfaces, and constraints', duration: 26 },
            { title: 'Union and Intersection Types', description: 'Combining types and narrowing with type guards', duration: 22 },
            { title: 'Utility Types — Partial, Pick, Omit, Record', description: 'Built-in helpers that save you from writing boilerplate', duration: 20 },
            { title: 'Decorators and Metadata', description: 'Class decorators, method decorators, and reflect-metadata', duration: 24 },
          ],
        },
        {
          title: 'TypeScript in the Real World',
          description: 'React and Node integration',
          lessons: [
            { title: 'TypeScript with React — Props, State, Events', description: 'Typing components, hooks, and event handlers', duration: 25 },
            { title: 'TypeScript with Express', description: 'Typed request/response objects and middleware', duration: 22 },
            { title: 'Migrating a JS Project to TypeScript', description: 'Incremental adoption strategy with allowJs', duration: 20 },
          ],
        },
      ],
    },
  ]

  for (const courseData of coursesData) {
    const { sections: sectionsData, ...courseFields } = courseData

    const course = await Course.create({
      ...courseFields,
      isPublished: true,
      publishedAt: new Date(),
    })

    const sectionIds = await createCurriculum(course._id, sectionsData)
    course.sections = sectionIds
    await course.save()

    console.log(`✅ Created: ${course.title}`)
  }

  console.log('\n🌱 Seed complete!')
  console.log('─────────────────────────────────────')
  console.log('Instructor accounts:')
  console.log('  alice@example.com   / password123')
  console.log('  bob@example.com     / password123')
  console.log('  carol@example.com   / password123')
  console.log('Student account:')
  console.log('  student@example.com / password123')
  console.log('─────────────────────────────────────')

  await mongoose.disconnect()
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})