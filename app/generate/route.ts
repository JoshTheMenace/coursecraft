import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { title, description } = await request.json()
  const course = {
    title: title || "Untitled Course",
    description: description || "No description provided.",
    modules: [
      {
        title: 'Module 1: Fundamentals',
        description: 'An introduction to the topic, fundamental concepts, and a foundation to build upon.',
        lessons: [
          { title: 'Lesson 1.1: Introduction', 
            content: `Welcome to the fundamentals! This lesson covers the topic overview, main concepts, and why it matters.\n\nYou will understand:\n- Core definitions\n- Practical examples\n- Relevance in real-world scenarios` 
          },
          { title: 'Lesson 1.2: Basic Concepts',
            content: `Here we delve deeper into the basic building blocks.\n\nTopics:\n- Essential principles\n- Simple exercises\n- Observing results\n\nBy the end, you should have a strong foundation.` 
          }
        ]
      },
      {
        title: 'Module 2: Advanced Topics',
        description: 'Explore complex aspects, advanced strategies, and best practices.',
        lessons: [
          { title: 'Lesson 2.1: Advanced Techniques',
            content: `This lesson deals with advanced strategies.\n\nYou will learn:\n- Complex case handling\n- Integrations with other frameworks\n- Efficient troubleshooting methods.` 
          },
          { title: 'Lesson 2.2: Case Studies',
            content: `Real-world applications of these concepts.\n\nStudy:\n- Detailed industry examples\n- Common pitfalls\n- Expert tips for mastery.\n\nThis final lesson prepares you for applying knowledge in practice.` 
          }
        ]
      }
    ]
  }

  return NextResponse.json({ course })
}
