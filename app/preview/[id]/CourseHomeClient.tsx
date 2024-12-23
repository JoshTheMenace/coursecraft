// app/preview/[id]/CourseHomeClient.tsx
'use client'

import { useCourse } from './CourseContextProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  BookOpenIcon,
  PencilSquareIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'; // If using Next.js Image
import React from 'react';

// Firebase imports – adjust path to your project's structure
import { db } from '../../../firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function CourseHomeClient({ id }: { id: string }) {
  const courseData = useCourse();
  if (!courseData) {
    return <div>Error: No course data.</div>;
  }

  const [isEditing, setIsEditing] = useState(false);

  // Top-level course fields
  const {
    title,
    subtitle,
    description,
    instructor,
    language,
    level,
    tags,
    pricing,
    stats,
    resources,
    modules,
  } = courseData;

  // Local state for top-level fields
  const [courseTitle, setCourseTitle] = useState(title);
  const [courseSubtitle, setCourseSubtitle] = useState(subtitle || '');
  const [courseDescription, setCourseDescription] = useState(description || '');
  const [courseTags, setCourseTags] = useState<string>(tags?.join(', ') || '');
  const [courseLanguage, setCourseLanguage] = useState(language || '');
  const [courseLevel, setCourseLevel] = useState(level || '');

  // Instructor
  const [instructorName, setInstructorName] = useState(instructor?.name || '');
  const [instructorBio, setInstructorBio] = useState(instructor?.bio || '');
  const [instructorAvatar, setInstructorAvatar] = useState(instructor?.avatar || '');
  const [instructorTwitter, setInstructorTwitter] = useState(instructor?.socialLinks?.twitter || '');
  const [instructorLinkedIn, setInstructorLinkedIn] = useState(instructor?.socialLinks?.linkedin || '');

  // Pricing
  const [isFree, setIsFree] = useState(pricing?.isFree || false);
  const [courseCost, setCourseCost] = useState(pricing?.cost?.toString() || '');
  const [discount, setDiscount] = useState(pricing?.discount?.toString() || '');
  const [currency, setCurrency] = useState(pricing?.currency || 'USD');

  // Stats
  const [views, setViews] = useState(stats?.views?.toString() || '');
  const [likes, setLikes] = useState(stats?.likes?.toString() || '');
  const [enrollments, setEnrollments] = useState(stats?.enrollments?.toString() || '');
  const [completions, setCompletions] = useState(stats?.completions?.toString() || '');
  const [averageRating, setAverageRating] = useState(stats?.averageRating?.toString() || '');
  const [ratingsCount, setRatingsCount] = useState(stats?.ratingsCount?.toString() || '');

  // Local modules array to edit
  const [localModules, setLocalModules] = useState<any[]>([]);

  // Load data from courseData into local state
  useEffect(() => {
    setCourseTitle(title);
    setCourseSubtitle(subtitle || '');
    setCourseDescription(description || '');
    setCourseTags(tags?.join(', ') || '');
    setCourseLanguage(language || '');
    setCourseLevel(level || '');

    setInstructorName(instructor?.name || '');
    setInstructorBio(instructor?.bio || '');
    setInstructorAvatar(instructor?.avatar || '');
    setInstructorTwitter(instructor?.socialLinks?.twitter || '');
    setInstructorLinkedIn(instructor?.socialLinks?.linkedin || '');

    setIsFree(pricing?.isFree || false);
    setCourseCost(pricing?.cost?.toString() || '');
    setDiscount(pricing?.discount?.toString() || '');
    setCurrency(pricing?.currency || 'USD');

    setViews(stats?.views?.toString() || '');
    setLikes(stats?.likes?.toString() || '');
    setEnrollments(stats?.enrollments?.toString() || '');
    setCompletions(stats?.completions?.toString() || '');
    setAverageRating(stats?.averageRating?.toString() || '');
    setRatingsCount(stats?.ratingsCount?.toString() || '');

    // Convert modules into something editable
    const modCopy = JSON.parse(JSON.stringify(modules)) || [];
    setLocalModules(modCopy);
  }, [courseData]);

  // Cancel reverts local states to original
  const handleCancel = () => {
    setIsEditing(false);
    // Re-run the effect logic to reset everything
    setCourseTitle(title);
    setCourseSubtitle(subtitle || '');
    setCourseDescription(description || '');
    setCourseTags(tags?.join(', ') || '');
    setCourseLanguage(language || '');
    setCourseLevel(level || '');

    setInstructorName(instructor?.name || '');
    setInstructorBio(instructor?.bio || '');
    setInstructorAvatar(instructor?.avatar || '');
    setInstructorTwitter(instructor?.socialLinks?.twitter || '');
    setInstructorLinkedIn(instructor?.socialLinks?.linkedin || '');

    setIsFree(pricing?.isFree || false);
    setCourseCost(pricing?.cost?.toString() || '');
    setDiscount(pricing?.discount?.toString() || '');
    setCurrency(pricing?.currency || 'USD');

    setViews(stats?.views?.toString() || '');
    setLikes(stats?.likes?.toString() || '');
    setEnrollments(stats?.enrollments?.toString() || '');
    setCompletions(stats?.completions?.toString() || '');
    setAverageRating(stats?.averageRating?.toString() || '');
    setRatingsCount(stats?.ratingsCount?.toString() || '');

    const modCopy = JSON.parse(JSON.stringify(modules)) || [];
    setLocalModules(modCopy);
  };

  // Save to Firestore
  const handleSave = async () => {
    try {
      // Clone entire course data
      const updatedCourseData = JSON.parse(JSON.stringify(courseData));

      // Update top-level fields
      updatedCourseData.title = courseTitle;
      updatedCourseData.subtitle = courseSubtitle;
      updatedCourseData.description = courseDescription;
      updatedCourseData.language = courseLanguage;
      updatedCourseData.level = courseLevel;
      updatedCourseData.tags = courseTags
        .split(',')
        .map((t: string) => t.trim())
        .filter((t: string) => t.length > 0);

      // Instructor
      updatedCourseData.instructor = {
        name: instructorName,
        bio: instructorBio,
        avatar: instructorAvatar,
        socialLinks: {
          twitter: instructorTwitter,
          linkedin: instructorLinkedIn,
        },
      };

      // Pricing
      updatedCourseData.pricing = {
        isFree,
        cost: isFree ? 0 : parseFloat(courseCost) || 0,
        discount: isFree ? 0 : parseFloat(discount) || 0,
        currency,
      };

      // Stats
      updatedCourseData.stats = {
        views: parseInt(views) || 0,
        likes: parseInt(likes) || 0,
        enrollments: parseInt(enrollments) || 0,
        completions: parseInt(completions) || 0,
        averageRating: parseFloat(averageRating) || 0,
        ratingsCount: parseInt(ratingsCount) || 0,
      };

      // **Update modules** from localModules
      updatedCourseData.modules = localModules;

      // Write to Firestore
      const docRef = doc(db, 'courses', courseData.id);
      await updateDoc(docRef, updatedCourseData);

      setIsEditing(false);
    } catch (error) {
      console.error('Error saving course data:', error);
    }
  };

  const patternDataUrl = `data:image/svg+xml;utf8,<svg width='40' height='40' 
    viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'>
    <rect width='40' height='40' fill='%23ffffff'/>
    <path d='M0 39.5 H40 M39.5 0 V40' stroke='%23ccc' stroke-width='0.25'/>
    </svg>`;

  return (
    <main 
      className="min-h-screen flex flex-col overflow-y-auto relative"
      style={{
        fontFamily: 'var(--font-family)',
        backgroundColor: 'var(--color-bg)',
        backgroundImage: `url("${patternDataUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '40px 40px',
      }}
    >
      {/* Header */}
      <header className="py-4 px-8 flex items-center justify-between bg-white shadow-sm z-10 relative">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
          <span className="text-2xl font-bold" style={{ color: 'var(--color-primary)' }}>
            {courseTitle}
          </span>
        </div>

        {/* Edit / Save / Cancel Buttons */}
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <CheckCircleIcon className="h-5 w-5" />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
          >
            <PencilSquareIcon className="h-5 w-5" />
            Edit
          </button>
        )}
      </header>

      {/* Main Content */}
      <motion.div
        initial={{opacity:0, y:20}}
        animate={{opacity:1, y:0}}
        transition={{type:'spring', stiffness:80, damping:20, delay:0.1}}
        className="flex-1 py-16 px-8 w-full md:w-3/4 lg:w-1/2 mx-auto overflow-y-auto relative"
      >
        {isEditing ? (
          // Show form for top-level course edits
          <EditCourseForm
            courseTitle={courseTitle}
            setCourseTitle={setCourseTitle}
            courseSubtitle={courseSubtitle}
            setCourseSubtitle={setCourseSubtitle}
            courseDescription={courseDescription}
            setCourseDescription={setCourseDescription}
            courseTags={courseTags}
            setCourseTags={setCourseTags}
            courseLanguage={courseLanguage}
            setCourseLanguage={setCourseLanguage}
            courseLevel={courseLevel}
            setCourseLevel={setCourseLevel}
            instructorName={instructorName}
            setInstructorName={setInstructorName}
            instructorBio={instructorBio}
            setInstructorBio={setInstructorBio}
            instructorAvatar={instructorAvatar}
            setInstructorAvatar={setInstructorAvatar}
            instructorTwitter={instructorTwitter}
            setInstructorTwitter={setInstructorTwitter}
            instructorLinkedIn={instructorLinkedIn}
            setInstructorLinkedIn={setInstructorLinkedIn}
            isFree={isFree}
            setIsFree={setIsFree}
            courseCost={courseCost}
            setCourseCost={setCourseCost}
            discount={discount}
            setDiscount={setDiscount}
            currency={currency}
            setCurrency={setCurrency}
            views={views}
            setViews={setViews}
            likes={likes}
            setLikes={setLikes}
            enrollments={enrollments}
            setEnrollments={setEnrollments}
            completions={completions}
            setCompletions={setCompletions}
            averageRating={averageRating}
            setAverageRating={setAverageRating}
            ratingsCount={ratingsCount}
            setRatingsCount={setRatingsCount}
          />
        ) : (
          // Show read-only view
          <ViewCourseInfo
            title={courseTitle}
            subtitle={courseSubtitle}
            description={courseDescription}
            tags={courseTags.split(',').map(t => t.trim()).filter(t => t)}
            language={courseLanguage}
            level={courseLevel}
            instructor={{
              name: instructorName,
              bio: instructorBio,
              avatar: instructorAvatar,
              socialLinks: {
                twitter: instructorTwitter,
                linkedin: instructorLinkedIn,
              },
            }}
            pricing={{
              isFree,
              cost: parseFloat(courseCost) || 0,
              discount: parseFloat(discount) || 0,
              currency,
            }}
            stats={{
              views: parseInt(views) || 0,
              likes: parseInt(likes) || 0,
              enrollments: parseInt(enrollments) || 0,
              completions: parseInt(completions) || 0,
              averageRating: parseFloat(averageRating) || 0,
              ratingsCount: parseInt(ratingsCount) || 0,
            }}
            resources={resources}
          />
        )}

        {/* Modules Section - Now also editable if isEditing */}
        <ModulesSection
          modules={localModules}
          setModules={setLocalModules}
          isEditing={isEditing}
          id={id}
        />
      </motion.div>
    </main>
  );
}

/**
 * We reuse the same approach: read/write form fields for modules in the ModulesSection.
 * We'll allow editing the module title, description, learning objectives (plus any other fields).
 */
function ModulesSection({
  modules,
  setModules,
  isEditing,
  id,
}: {
  modules: any[];
  setModules: React.Dispatch<React.SetStateAction<any[]>>;
  isEditing: boolean;
  id: string;
}) {
  const [openModuleIndex, setOpenModuleIndex] = useState<number | null>(null);

  const toggleModule = (index: number) => {
    setOpenModuleIndex(openModuleIndex === index ? null : index);
  };

  // Update the module in localModules
  const handleModuleChange = (moduleIndex: number, field: string, value: any) => {
    setModules(prev => {
      const newMods = [...prev];
      newMods[moduleIndex] = {
        ...newMods[moduleIndex],
        [field]: value,
      };
      return newMods;
    });
  };

  // Update a single learning objective
  const handleLearningObjectiveChange = (moduleIndex: number, objIndex: number, value: string) => {
    setModules(prev => {
      const newMods = [...prev];
      const currentObjectives = newMods[moduleIndex].learningObjectives || [];
      currentObjectives[objIndex] = value;
      newMods[moduleIndex].learningObjectives = currentObjectives;
      return newMods;
    });
  };

  return (
    <section className="mb-12">
      <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-primary)' }}>
        Modules
      </h2>
      <div className="space-y-4">
        {modules.map((m: any, mIdx: number) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 80, damping: 20, delay: 0.1 + mIdx * 0.05 }}
            className="border border-gray-300 rounded-lg shadow-sm overflow-hidden"
          >
            <div
              className="flex items-center justify-between px-6 py-4 bg-gray-100 cursor-pointer hover:bg-gray-200 transition"
              onClick={() => toggleModule(mIdx)}
            >
              {!isEditing ? (
                <h3 className="font-semibold text-lg" style={{ color: 'var(--color-primary)' }}>
                  {m.title}
                </h3>
              ) : (
                <input
                  className="font-semibold text-lg border border-gray-300 p-1 rounded w-2/3"
                  style={{ color: 'var(--color-primary)' }}
                  value={m.title || ''}
                  onChange={(e) => handleModuleChange(mIdx, 'title', e.target.value)}
                />
              )}
              <span className="text-gray-500">
                {openModuleIndex === mIdx ? '▲' : '▼'}
              </span>
            </div>

            <AnimatePresence>
              {openModuleIndex === mIdx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 py-4 bg-white"
                >
                  {/* Module description */}
                  {!isEditing ? (
                    <p className="text-gray-700 mb-4 leading-relaxed">{m.description}</p>
                  ) : (
                    <div className="mb-4">
                      <label className="block font-semibold mb-1">Module Description</label>
                      <textarea
                        className="w-full border p-2 rounded"
                        rows={3}
                        value={m.description || ''}
                        onChange={(e) => handleModuleChange(mIdx, 'description', e.target.value)}
                      />
                    </div>
                  )}

                  {/* Learning Objectives */}
                  {m.learningObjectives && m.learningObjectives.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-2" style={{ color: 'var(--color-primary)' }}>
                        Learning Objectives
                      </h4>
                      {!isEditing ? (
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {m.learningObjectives.map((obj: string, i: number) => (
                            <li key={i}>{obj}</li>
                          ))}
                        </ul>
                      ) : (
                        <ul className="space-y-2">
                          {m.learningObjectives.map((obj: string, i: number) => (
                            <li key={i}>
                              <input
                                type="text"
                                className="w-full border p-1 rounded"
                                value={obj}
                                onChange={(e) =>
                                  handleLearningObjectiveChange(mIdx, i, e.target.value)
                                }
                              />
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Lessons */}
                  {m.lessons && m.lessons.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Lessons
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.lessons.map((l: any) => (
                          <Link
                            key={l.id}
                            href={`/preview/${id}/lesson/${m.id}~${l.id}`}
                            className="block px-4 py-3 bg-indigo-500 text-white font-semibold rounded-lg shadow hover:bg-indigo-600 hover:shadow-md transition-all"
                          >
                            {l.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quiz */}
                  {m.quiz && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Quiz
                      </h4>
                      <Link
                        href={`/preview/${id}/quiz/${m.id}_${m.quiz.id}`}
                        className="inline-block px-4 py-3 bg-pink-500 text-white font-semibold rounded-lg shadow hover:bg-pink-600 hover:shadow-md transition-all"
                      >
                        Take the Quiz
                      </Link>
                    </div>
                  )}

                  {/* Interactive Activities */}
                  {m.interactiveActivities && m.interactiveActivities.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Interactive Activities
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {m.interactiveActivities.map((act: any) => (
                          <Link
                            key={act.id}
                            href={`/preview/${id}/activity/${m.id}_${act.id}`}
                            className="block px-4 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 hover:shadow-md transition-all"
                          >
                            {act.type === 'matching' ? 'Matching Activity' : 'Activity'}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Module Resources */}
                  {m.resources && m.resources.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-lg font-bold mb-4" style={{ color: 'var(--color-primary)' }}>
                        Module Resources
                      </h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {m.resources.map((r:any, idx:number) => (
                          <li key={idx}>
                            <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              {r.title} ({r.type.toUpperCase()})
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </section>
  );
}



/**
 * A form component that shows inputs for each editable field.
 */
function EditCourseForm(props: {
  courseTitle: string; setCourseTitle: (v: string) => void;
  courseSubtitle: string; setCourseSubtitle: (v: string) => void;
  courseDescription: string; setCourseDescription: (v: string) => void;
  courseTags: string; setCourseTags: (v: string) => void;
  courseLanguage: string; setCourseLanguage: (v: string) => void;
  courseLevel: string; setCourseLevel: (v: string) => void;

  instructorName: string; setInstructorName: (v: string) => void;
  instructorBio: string; setInstructorBio: (v: string) => void;
  instructorAvatar: string; setInstructorAvatar: (v: string) => void;
  instructorTwitter: string; setInstructorTwitter: (v: string) => void;
  instructorLinkedIn: string; setInstructorLinkedIn: (v: string) => void;

  isFree: boolean; setIsFree: (v: boolean) => void;
  courseCost: string; setCourseCost: (v: string) => void;
  discount: string; setDiscount: (v: string) => void;
  currency: string; setCurrency: (v: string) => void;

  views: string; setViews: (v: string) => void;
  likes: string; setLikes: (v: string) => void;
  enrollments: string; setEnrollments: (v: string) => void;
  completions: string; setCompletions: (v: string) => void;
  averageRating: string; setAverageRating: (v: string) => void;
  ratingsCount: string; setRatingsCount: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Course Title */}
      <div>
        <label className="block font-semibold mb-1">Course Title</label>
        <input
          className="w-full border p-2 rounded"
          value={props.courseTitle}
          onChange={(e) => props.setCourseTitle(e.target.value)}
        />
      </div>

      {/* Subtitle */}
      <div>
        <label className="block font-semibold mb-1">Subtitle</label>
        <input
          className="w-full border p-2 rounded"
          value={props.courseSubtitle}
          onChange={(e) => props.setCourseSubtitle(e.target.value)}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block font-semibold mb-1">Description</label>
        <textarea
          className="w-full border p-2 rounded"
          rows={4}
          value={props.courseDescription}
          onChange={(e) => props.setCourseDescription(e.target.value)}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block font-semibold mb-1">Tags (comma separated)</label>
        <input
          className="w-full border p-2 rounded"
          value={props.courseTags}
          onChange={(e) => props.setCourseTags(e.target.value)}
        />
      </div>

      {/* Language and Level */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Language</label>
          <input
            className="w-full border p-2 rounded"
            value={props.courseLanguage}
            onChange={(e) => props.setCourseLanguage(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Level</label>
          <input
            className="w-full border p-2 rounded"
            value={props.courseLevel}
            onChange={(e) => props.setCourseLevel(e.target.value)}
          />
        </div>
      </div>

      {/* Instructor Info */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold mb-2">Instructor Info</h3>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Name</label>
          <input
            className="w-full border p-2 rounded"
            value={props.instructorName}
            onChange={(e) => props.setInstructorName(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Bio</label>
          <textarea
            className="w-full border p-2 rounded"
            rows={2}
            value={props.instructorBio}
            onChange={(e) => props.setInstructorBio(e.target.value)}
          />
        </div>
        <div className="mb-2">
          <label className="block font-semibold mb-1">Avatar URL</label>
          <input
            className="w-full border p-2 rounded"
            value={props.instructorAvatar}
            onChange={(e) => props.setInstructorAvatar(e.target.value)}
          />
        </div>
        <div className="mb-2 flex gap-2">
          <div className="flex-1">
            <label className="block font-semibold mb-1">Twitter URL</label>
            <input
              className="w-full border p-2 rounded"
              value={props.instructorTwitter}
              onChange={(e) => props.setInstructorTwitter(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block font-semibold mb-1">LinkedIn URL</label>
            <input
              className="w-full border p-2 rounded"
              value={props.instructorLinkedIn}
              onChange={(e) => props.setInstructorLinkedIn(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold mb-2">Pricing</h3>
        <div className="flex items-center mb-2">
          <input
            id="isFree"
            type="checkbox"
            className="mr-2"
            checked={props.isFree}
            onChange={() => props.setIsFree(!props.isFree)}
          />
          <label htmlFor="isFree" className="font-semibold">Is this course free?</label>
        </div>
        {!props.isFree && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-semibold mb-1">Cost</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={props.courseCost}
                onChange={(e) => props.setCourseCost(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Discount</label>
              <input
                type="number"
                className="w-full border p-2 rounded"
                value={props.discount}
                onChange={(e) => props.setDiscount(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block font-semibold mb-1">Currency</label>
              <input
                type="text"
                className="w-full border p-2 rounded"
                value={props.currency}
                onChange={(e) => props.setCurrency(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-bold mb-2">Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1">Views</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={props.views}
              onChange={(e) => props.setViews(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Likes</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={props.likes}
              onChange={(e) => props.setLikes(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Enrollments</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={props.enrollments}
              onChange={(e) => props.setEnrollments(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Completions</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={props.completions}
              onChange={(e) => props.setCompletions(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Avg Rating</label>
            <input
              type="number"
              step="0.1"
              className="w-full border p-2 rounded"
              value={props.averageRating}
              onChange={(e) => props.setAverageRating(e.target.value)}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Ratings Count</label>
            <input
              type="number"
              className="w-full border p-2 rounded"
              value={props.ratingsCount}
              onChange={(e) => props.setRatingsCount(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * A read-only view of the course info.
 * This is what you had originally, but extracted into a sub-component.
 */
function ViewCourseInfo(props: {
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  language: string;
  level: string;
  instructor: {
    name: string;
    bio: string;
    avatar?: string;
    socialLinks?: {
      twitter?: string;
      linkedin?: string;
    };
  };
  pricing: {
    isFree: boolean;
    cost: number;
    discount: number;
    currency: string;
  };
  stats: {
    views: number;
    likes: number;
    enrollments: number;
    completions: number;
    averageRating: number;
    ratingsCount: number;
  };
  resources?: any[];
}) {
  const {
    title,
    subtitle,
    description,
    tags,
    language,
    level,
    instructor,
    pricing,
    stats,
    resources
  } = props;

  return (
    <>
      <section className="mb-12">
        <h1 className="text-5xl font-extrabold mb-2" style={{color:'var(--color-primary)'}}>
          {title}
        </h1>
        {subtitle && <h2 className="text-2xl font-semibold text-gray-700 mb-4">{subtitle}</h2>}
        <p className="text-gray-700 text-lg leading-relaxed mb-6">{description}</p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag: string, idx: number) => (
              <span key={idx} className="px-2 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Instructor Info */}
        {instructor && (
          <div className="flex items-center gap-4 mb-6">
            {instructor.avatar && (
              <img
                src={instructor.avatar}
                alt={`${instructor.name} avatar`}
                className="w-16 h-16 rounded-full border"
              />
            )}
            <div>
              <h3 className="text-xl font-bold" style={{color:'var(--color-primary)'}}>
                {instructor.name}
              </h3>
              <p className="text-gray-600 text-sm">{instructor.bio}</p>
              <div className="flex gap-2 mt-2">
                {instructor.socialLinks?.twitter && (
                  <a 
                    href={instructor.socialLinks.twitter} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Twitter
                  </a>
                )}
                {instructor.socialLinks?.linkedin && (
                  <a 
                    href={instructor.socialLinks.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Language and Level */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {language && (
            <div>
              <span className="font-semibold">Language: </span>
              <span className="text-gray-700">{language}</span>
            </div>
          )}
          {level && (
            <div>
              <span className="font-semibold">Level: </span>
              <span className="text-gray-700">{level}</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        {pricing && (
          <div className="mb-6">
            {pricing.isFree ? (
              <span className="text-green-700 font-semibold">This course is free!</span>
            ) : (
              <div>
                <span className="font-semibold">Price: </span>
                <span className="text-gray-700">
                  {pricing.currency} {pricing.cost - (pricing.discount || 0)}
                  {pricing.discount > 0 && (
                    <span className="line-through text-gray-500 ml-2">
                      {pricing.currency} {pricing.cost}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-700">
            <div><strong>Views:</strong> {stats.views}</div>
            <div><strong>Likes:</strong> {stats.likes}</div>
            <div><strong>Enrollments:</strong> {stats.enrollments}</div>
            <div><strong>Completions:</strong> {stats.completions}</div>
            <div><strong>Rating:</strong> {stats.averageRating} ({stats.ratingsCount} ratings)</div>
          </div>
        )}

        {/* Additional Resources */}
        {resources && resources.length > 0 && (
          <div className="mb-8">
            <h4 className="text-xl font-bold mb-4" style={{color:'var(--color-primary)'}}>
              Additional Resources
            </h4>
            <ul className="list-disc list-inside text-gray-700">
              {resources.map((r:any, idx: number) => (
                <li key={idx}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {r.title} ({r.type.toUpperCase()})
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

      </section>
    </>
  );
}



