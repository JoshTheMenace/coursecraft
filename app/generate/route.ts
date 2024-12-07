import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { title, description } = await request.json()
  // Mock generation logic
  const course = {
    title: title || "Untitled Course",
    description: description || "No description provided.",
    lessons: [
      { title: 'Introduction', content: 'An introductory lesson...' },
      { title: 'Lesson 1: Basics', content: 'The basics of the topic...' },
      { title: 'Lesson 2: Advanced Concepts', content: 'Some advanced stuff...' }
    ]
  }

  return NextResponse.json({ course })
}
