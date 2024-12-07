import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { title, description } = await request.json()
  // Mock more complex generation with modules and lessons
  const course = {
    title: title || "Untitled Course",
    description: description || "No description provided.",
    modules: [
      {
        title: 'Module 1: Fundamentals',
        description: 'Get introduced to the topic, understand core concepts, and build a foundation.',
        lessons: [
          { title: 'Lesson 1.1: Introduction', 
            content: `Welcome to the fundamentals! In this lesson, we will overview the entire topic, set expectations, and clarify learning objectives.\n\nKey topics:\n- Overview of subject area\n- Fundamental terms and definitions\n- Real-world examples to spark interest.` 
          },
          { title: 'Lesson 1.2: Basic Concepts',
            content: `This lesson dives deeper into the basic concepts.\n\nYou will learn:\n- Core principles\n- Common methods and approaches\n- Basic exercises to test knowledge.\n\nBy the end, you should have a solid understanding of the essential building blocks.` 
          }
        ]
      },
      {
        title: 'Module 2: Advanced Topics',
        description: 'Explore more complex aspects, advanced techniques, and best practices.',
        lessons: [
          { title: 'Lesson 2.1: Advanced Techniques',
            content: `This lesson covers advanced techniques.\n\nYou'll understand:\n- Complex scenarios\n- High-level strategies\n- Integrations with other systems.\n\nPractice these techniques with provided activities and review them in quizzes.` 
          },
          { title: 'Lesson 2.2: Case Studies',
            content: `In this final lesson, we explore real-world case studies.\n\nDiscover:\n- Detailed examples of the topic in action\n- Troubleshooting and pitfalls\n- Expert advice and next steps.\n\nBy the end, you’ll be able to apply these insights to your own projects.` 
          }
        ]
      }
    ]
  }

  return NextResponse.json({ course })
}
