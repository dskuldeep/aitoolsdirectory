import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user with password
  const adminPassword = await hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agitracker.io' },
    update: {
      password: adminPassword, // Update password if user exists
    },
    create: {
      email: 'admin@agitracker.io',
      name: 'Admin User',
      role: 'admin',
      password: adminPassword,
    },
  })

  // Create editor user
  const editor = await prisma.user.upsert({
    where: { email: 'editor@agitracker.io' },
    update: {},
    create: {
      email: 'editor@agitracker.io',
      name: 'Editor User',
      role: 'editor',
    },
  })

  // Create sample tools
  const tools = [
    {
      slug: 'chatgpt',
      name: 'ChatGPT',
      tagline: 'Conversational AI assistant',
      description:
        'ChatGPT is an AI-powered conversational assistant that can help with a wide range of tasks including writing, coding, analysis, and creative projects.',
      category: 'Productivity',
      tags: ['ai', 'chat', 'assistant', 'openai'],
      website: 'https://chat.openai.com',
      pricing: 'Freemium',
      license: 'Proprietary',
      integrations: ['API', 'Slack', 'Discord'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
          alt: 'ChatGPT interface showing conversation',
        },
        {
          url: 'https://images.unsplash.com/photo-1682609909517-1b1b7c4b5e5a?w=1200&h=600&fit=crop',
          alt: 'ChatGPT code generation example',
        },
      ],
      approved: true,
      featured: true,
    },
    {
      slug: 'github-copilot',
      name: 'GitHub Copilot',
      tagline: 'AI pair programmer',
      description:
        'GitHub Copilot is an AI pair programmer that suggests code and entire functions in real-time, right from your editor.',
      category: 'Development',
      tags: ['coding', 'ai', 'github', 'vscode'],
      website: 'https://github.com/features/copilot',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['VS Code', 'JetBrains', 'Neovim'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
          alt: 'GitHub Copilot in VS Code',
        },
        {
          url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop',
          alt: 'Code suggestions from Copilot',
        },
      ],
      approved: true,
      featured: true,
    },
    {
      slug: 'midjourney',
      name: 'Midjourney',
      tagline: 'AI image generation',
      description:
        'Midjourney is an AI art generator that creates stunning images from text descriptions using advanced machine learning.',
      category: 'Design',
      tags: ['ai', 'art', 'image-generation', 'creative'],
      website: 'https://midjourney.com',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['Discord'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
          alt: 'AI generated artwork examples',
        },
        {
          url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop',
          alt: 'Midjourney interface',
        },
      ],
      approved: true,
      featured: false,
    },
    {
      slug: 'notion-ai',
      name: 'Notion AI',
      tagline: 'AI writing assistant in Notion',
      description:
        'Notion AI helps you write, edit, summarize, and brainstorm ideas directly within your Notion workspace.',
      category: 'Productivity',
      tags: ['writing', 'ai', 'notion', 'productivity'],
      website: 'https://notion.so',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['Notion'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=600&fit=crop',
          alt: 'Notion workspace with AI features',
        },
      ],
      approved: true,
      featured: false,
    },
    {
      slug: 'claude',
      name: 'Claude',
      tagline: 'AI assistant by Anthropic',
      description:
        'Claude is a helpful, harmless, and honest AI assistant that can assist with various tasks including analysis, writing, and coding.',
      category: 'Productivity',
      tags: ['ai', 'chat', 'assistant', 'anthropic'],
      website: 'https://claude.ai',
      pricing: 'Freemium',
      license: 'Proprietary',
      integrations: ['API', 'Slack'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
          alt: 'Claude AI interface',
        },
      ],
      approved: true,
      featured: true,
    },
    {
      slug: 'stable-diffusion',
      name: 'Stable Diffusion',
      tagline: 'Open source image generation',
      description:
        'Stable Diffusion is an open-source AI image generation model that can create images from text prompts.',
      category: 'Design',
      tags: ['ai', 'art', 'open-source', 'image-generation'],
      website: 'https://stability.ai',
      pricing: 'Free',
      license: 'Open Source',
      integrations: ['API', 'Hugging Face'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
          alt: 'Stable Diffusion generated images',
        },
      ],
      approved: true,
      featured: false,
    },
    {
      slug: 'grammarly',
      name: 'Grammarly',
      tagline: 'AI writing assistant',
      description:
        'Grammarly is an AI-powered writing assistant that helps improve grammar, clarity, and style across various platforms.',
      category: 'Writing',
      tags: ['writing', 'grammar', 'ai', 'productivity'],
      website: 'https://grammarly.com',
      pricing: 'Freemium',
      license: 'Proprietary',
      integrations: ['Chrome', 'Word', 'Google Docs'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=600&fit=crop',
          alt: 'Grammarly writing suggestions',
        },
      ],
      approved: true,
      featured: false,
    },
    {
      slug: 'jasper',
      name: 'Jasper',
      tagline: 'AI content generator',
      description:
        'Jasper is an AI content generator that helps create marketing copy, blog posts, and other written content.',
      category: 'Marketing',
      tags: ['content', 'marketing', 'ai', 'writing'],
      website: 'https://jasper.ai',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['Chrome', 'WordPress'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
          alt: 'Jasper content creation interface',
        },
      ],
      approved: true,
      featured: false,
    },
    {
      slug: 'copilot-x',
      name: 'GitHub Copilot X',
      tagline: 'Next-gen AI coding assistant',
      description:
        'GitHub Copilot X is the next generation of AI coding assistance with chat, terminal, and pull request features.',
      category: 'Development',
      tags: ['coding', 'ai', 'github', 'developer'],
      website: 'https://github.com/features/preview/copilot-x',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['VS Code', 'GitHub'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
          alt: 'GitHub Copilot X features',
        },
      ],
      approved: true,
      featured: true,
    },
    {
      slug: 'dalle-2',
      name: 'DALL-E 2',
      tagline: 'AI image generation by OpenAI',
      description:
        'DALL-E 2 is an AI system that can create realistic images and art from natural language descriptions.',
      category: 'Design',
      tags: ['ai', 'art', 'image-generation', 'openai'],
      website: 'https://openai.com/dall-e-2',
      pricing: 'Paid',
      license: 'Proprietary',
      integrations: ['API'],
      screenshots: [
        {
          url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
          alt: 'DALL-E 2 generated artwork',
        },
        {
          url: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop',
          alt: 'DALL-E 2 interface',
        },
      ],
      approved: true,
      featured: false,
    },
  ]

  for (const tool of tools) {
    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {},
      create: tool,
    })
  }

  // Create sample articles
  const articles = [
    {
      slug: 'top-10-ai-tools-2024',
      title: 'Top 10 AI Tools to Boost Your Productivity in 2024',
      excerpt:
        'Discover the most powerful AI tools that can transform your workflow and increase productivity.',
      heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
      body: `# Top 10 AI Tools to Boost Your Productivity in 2024

The AI landscape has exploded with innovative tools that can help you work smarter, not harder. Here are our top picks for 2024.

## 1. ChatGPT

ChatGPT continues to be a game-changer for content creation, coding assistance, and problem-solving.

## 2. GitHub Copilot

For developers, GitHub Copilot is an essential tool that speeds up coding significantly.

## 3. Notion AI

Notion AI brings powerful writing and organization capabilities to your workspace.

[Continue reading...]`,
      authorId: editor.id,
      tags: ['productivity', 'ai', 'tools', '2024'],
      published: true,
      publishedAt: new Date(),
    },
    {
      slug: 'getting-started-with-ai-coding-assistants',
      title: 'Getting Started with AI Coding Assistants',
      excerpt:
        'Learn how AI coding assistants can help you write better code faster and with fewer errors.',
      heroImage: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop',
      body: `# Getting Started with AI Coding Assistants

AI coding assistants are revolutionizing software development. Here's how to get started.

## What are AI Coding Assistants?

AI coding assistants use machine learning to help developers write code more efficiently.

## Benefits

- Faster development
- Fewer bugs
- Better code quality
- Learning tool

[Continue reading...]`,
      authorId: editor.id,
      tags: ['development', 'ai', 'coding', 'tutorial'],
      published: true,
      publishedAt: new Date(),
    },
    {
      slug: 'ai-image-generation-comparison',
      title: 'AI Image Generation: A Complete Comparison',
      excerpt:
        'Compare the top AI image generation tools and find the best one for your needs.',
      heroImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=600&fit=crop',
      body: `# AI Image Generation: A Complete Comparison

The world of AI image generation is rapidly evolving. Here's how the top tools compare.

## Midjourney

Known for artistic and creative outputs.

## DALL-E 2

Great for realistic and detailed images.

## Stable Diffusion

Open-source and highly customizable.

[Continue reading...]`,
      authorId: editor.id,
      tags: ['ai', 'image-generation', 'comparison', 'design'],
      published: true,
      publishedAt: new Date(),
    },
    {
      slug: 'how-to-submit-your-ai-tool',
      title: 'How to Submit Your AI Tool to Our Directory',
      excerpt:
        'A step-by-step guide to submitting your AI tool and getting it featured in our directory.',
      heroImage: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1200&h=600&fit=crop',
      body: `# How to Submit Your AI Tool to Our Directory

Want to get your AI tool featured? Here's everything you need to know.

## Step 1: Prepare Your Information

Gather all the details about your tool including description, screenshots, and links.

## Step 2: Fill Out the Form

Use our submission form to provide all necessary information.

## Step 3: Wait for Review

Our team will review your submission and get back to you.

[Continue reading...]`,
      authorId: admin.id,
      tags: ['guide', 'submission', 'tools'],
      published: true,
      publishedAt: new Date(),
    },
    {
      slug: 'future-of-ai-tools',
      title: 'The Future of AI Tools: What to Expect',
      excerpt:
        'Exploring the trends and innovations shaping the future of AI-powered tools.',
      heroImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=600&fit=crop',
      body: `# The Future of AI Tools: What to Expect

The AI tool landscape is evolving rapidly. Here's what we can expect in the coming years.

## Trends to Watch

- More specialized tools
- Better integration
- Improved accuracy
- Lower costs

## Conclusion

The future of AI tools is bright and full of possibilities.

[Continue reading...]`,
      authorId: editor.id,
      tags: ['ai', 'future', 'trends', 'technology'],
      published: true,
      publishedAt: new Date(),
    },
  ]

  for (const article of articles) {
    await prisma.article.upsert({
      where: { slug: article.slug },
      update: {
        heroImage: article.heroImage,
        title: article.title,
        excerpt: article.excerpt,
        body: article.body,
        tags: article.tags,
        published: article.published,
        publishedAt: article.publishedAt,
      },
      create: article,
    })
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

