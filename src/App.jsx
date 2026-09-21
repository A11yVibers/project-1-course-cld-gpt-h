import { useMemo, useState } from 'react'
import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'
import assignmentText from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'
import lecturePdf from '../project-assets/materials/silk_roads_class_01_lecture.pdf?url'
import lectureVideo from '../project-assets/materials/silk_roads_class_01_lecture.mp4?url'

function parseCsv(text) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    if (character === '"' && quoted && text[index + 1] === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && text[index + 1] === '\n') index += 1
      row.push(value)
      if (row.some((cell) => cell.length)) rows.push(row)
      row = []
      value = ''
    } else {
      value += character
    }
  }
  if (value || row.length) {
    row.push(value)
    rows.push(row)
  }

  const [headers, ...records] = rows
  return records.map((record) => Object.fromEntries(headers.map((header, index) => [header, record[index] ?? ''])))
}

const courses = parseCsv(coursesCsv)
const classes = parseCsv(classesCsv)
const instructors = parseCsv(instructorsCsv)
const materials = parseCsv(materialsCsv)
const instructorById = Object.fromEntries(instructors.map((instructor) => [instructor.instructor_id, instructor]))

const Icons = {
  Arrow: ({ direction = 'right' }) => <svg className={`icon arrow-${direction}`} viewBox="0 0 24 24" aria-hidden="true"><path d="m9 18 6-6-6-6" /></svg>,
  Book: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z" /><path d="M8 7h8M8 10h7" /></svg>,
  Calendar: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM3 9h18M8 2v4m8-4v4" /></svg>,
  File: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h8l4 4v16H6V2Z" /><path d="M14 2v5h5M9 12h6m-6 4h6" /></svg>,
  Filter: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M7 12h10m-7 7h4" /></svg>,
  Menu: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>,
  Play: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m9 7 8 5-8 5V7Z" /></svg>,
  Search: () => <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>,
}

function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${date}T12:00:00`))
}

function materialIcon(type) {
  return type === 'video' || type === 'youtube' ? <Icons.Play /> : <Icons.File />
}

function Catalog({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructor, setInstructor] = useState('all')
  const [duration, setDuration] = useState('all')

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const teacher = instructorById[course.instructor_id]
    const searchable = `${course.name} ${course.short_description} ${teacher.name}`.toLowerCase()
    const matchesQuery = searchable.includes(query.toLowerCase().trim())
    const matchesInstructor = instructor === 'all' || course.instructor_id === instructor
    const weeks = Number(course.number_of_weeks)
    const matchesDuration = duration === 'all' || (duration === 'short' ? weeks <= 5 : duration === 'medium' ? weeks === 6 : weeks >= 7)
    return matchesQuery && matchesInstructor && matchesDuration
  }), [query, instructor, duration])

  return <div className="catalog-page">
    <header className="site-header">
      <button className="brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <span className="brand-mark"><Icons.Book /></span>
        <span><strong>PALIMPSEST</strong><small>History, studied deeply</small></span>
      </button>
      <nav aria-label="Primary navigation"><a href="#catalog">Courses</a><a href="#approach">Our approach</a></nav>
      <button className="library-button" type="button" onClick={() => document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' })}>Browse library <Icons.Arrow /></button>
    </header>

    <main>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">A living archive of human experience</p>
          <h1 id="hero-title">The past is never <em>finished.</em></h1>
          <p>Study the people, ideas, conflicts, and exchanges that made our world—with courses built for careful looking and independent thought.</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => document.querySelector('#catalog')?.scrollIntoView({ behavior: 'smooth' })}>Explore the courses <Icons.Arrow /></button>
            <span><strong>12</strong> scholar-led courses</span>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbital orbital-one" />
          <div className="orbital orbital-two" />
          <span className="year year-one">3000 BCE</span><span className="year year-two">476</span><span className="year year-three">1453</span><span className="year year-four">1914</span>
          <div className="archive-card archive-main"><span>ARCHIVE / 11</span><strong>Routes of exchange</strong><small>Across empires & oceans</small></div>
          <div className="archive-card archive-small"><span>OBJECT / 048</span><strong>Trace the evidence</strong></div>
        </div>
      </section>

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-title">
        <div className="section-heading"><div><p className="eyebrow">The course archive</p><h2 id="catalog-title">Choose a path through history.</h2></div><p>{filteredCourses.length} of {courses.length} courses</p></div>
        <div className="catalog-tools">
          <label className="search-field"><span className="sr-only">Search courses</span><Icons.Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a period, place, or instructor…" /></label>
          <label className="select-field"><Icons.Filter /><span className="sr-only">Filter by instructor</span><select value={instructor} onChange={(event) => setInstructor(event.target.value)}><option value="all">All instructors</option>{instructors.map((person) => <option value={person.instructor_id} key={person.instructor_id}>{person.name}</option>)}</select></label>
          <label className="select-field"><Icons.Calendar /><span className="sr-only">Filter by duration</span><select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="all">Any duration</option><option value="short">5 weeks</option><option value="medium">6 weeks</option><option value="long">7+ weeks</option></select></label>
        </div>

        {filteredCourses.length ? <div className="course-grid">{filteredCourses.map((course, index) => {
          const teacher = instructorById[course.instructor_id]
          return <article className={`course-card ${course.course_id === 'HIST111' ? 'featured-course' : ''}`} key={course.course_id}>
            <button type="button" className="course-card-button" onClick={() => onSelectCourse(course)} aria-label={`Open ${course.name}`}>
              <div className="course-image-wrap"><img src={course.image_url} alt="" /><span className="course-number">{String(index + 1).padStart(2, '0')}</span>{course.course_id === 'HIST111' && <span className="featured-label">Fully illustrated course</span>}</div>
              <div className="course-card-content">
                <p className="course-code">{course.course_id} <span /> {course.number_of_weeks} weeks</p>
                <h3>{course.name}</h3>
                <p>{course.short_description}</p>
                <div className="course-card-footer"><span><img src={teacher.photo_url} alt="" />{teacher.name}</span><span className="circle-arrow"><Icons.Arrow /></span></div>
              </div>
            </button>
          </article>
        })}</div> : <div className="empty-state"><strong>No courses found.</strong><p>Try a broader search or clear one of the filters.</p><button type="button" onClick={() => { setQuery(''); setInstructor('all'); setDuration('all') }}>Clear filters</button></div>}
      </section>

      <section className="approach" id="approach"><p className="eyebrow">How we study</p><div><h2>History is an argument,<br />not a list of dates.</h2><p>Every Palimpsest course brings primary sources, interpretation, geography, and lived experience into the same frame. Follow evidence. Notice whose voice is missing. Build your own account of what happened—and why it matters.</p></div></section>
    </main>
    <footer><span>PALIMPSEST</span><p>A digital place for the serious study of history.</p><small>Course archive · Autumn 2026</small></footer>
  </div>
}

function MarkdownView({ text }) {
  const lines = text.split('\n')
  return <article className="markdown-view">{lines.map((line, index) => {
    if (line.startsWith('# ')) return <h1 key={index}>{line.slice(2)}</h1>
    if (line.startsWith('## ')) return <h2 key={index}>{line.slice(3)}</h2>
    if (line.startsWith('### ')) return <h3 key={index}>{line.slice(4)}</h3>
    if (line.startsWith('- ')) return <li key={index}>{line.slice(2).replaceAll('**', '')}</li>
    if (/^\d+\. /.test(line)) return <li key={index}>{line.replace(/^\d+\. /, '').replaceAll('**', '')}</li>
    if (line.trim()) return <p key={index}>{line.replaceAll('**', '')}</p>
    return null
  })}</article>
}

function CoursePage({ course, onBack }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const teacher = instructorById[course.instructor_id]
  const courseClasses = classes.filter((item) => item.course_id === course.course_id)
  const courseMaterials = materials.filter((item) => item.course_id === course.course_id)

  const getMaterials = (classId) => courseMaterials.filter((material) => material.class_id === classId).sort((a, b) => Number(a.display_order) - Number(b.display_order))
  const youtubeId = selectedMaterial?.material_type === 'youtube' ? selectedMaterial.file_path.match(/youtu\.be\/([^?]+)/)?.[1] : null

  return <div className={`course-page ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
    <header className="course-header">
      <button className="course-brand" type="button" onClick={onBack}><span className="brand-mark"><Icons.Book /></span><strong>PALIMPSEST</strong></button>
      <button className="back-button" type="button" onClick={onBack}><Icons.Arrow direction="left" /> Course archive</button>
      <div className="course-header-title"><span>{course.course_id}</span><strong>{course.name}</strong></div>
      <button className="header-menu" type="button" aria-label="Toggle course information" aria-expanded={sidebarOpen} onClick={() => setSidebarOpen((open) => !open)}><Icons.Menu /></button>
    </header>

    <main className="course-workspace">
      <aside className="course-sidebar" aria-label="Course information and syllabus" aria-hidden={!sidebarOpen}>
        <div className="sidebar-scroll">
          <div className="course-intro">
            <button className="collapse-button" type="button" onClick={() => setSidebarOpen(false)} aria-label="Collapse course information"><Icons.Arrow direction="left" /></button>
            <p className="eyebrow">Course {course.course_id}</p><h1>{course.name}</h1><p>{course.long_description}</p>
            <div className="course-facts"><span><Icons.Calendar /><strong>{course.number_of_weeks} weeks</strong><small>{course.number_of_classes} classes</small></span><span><Icons.Book /><strong>Autumn 2026</strong><small>Independent study</small></span></div>
            <div className="instructor"><img src={teacher.photo_url} alt={`Portrait of ${teacher.name}`} /><span><small>Your instructor</small><strong>{teacher.name}</strong><a href={`mailto:${teacher.email}`}>{teacher.email}</a></span></div>
          </div>
          <div className="syllabus-heading"><p className="eyebrow">Course syllabus</p><span>{courseClasses.length} classes</span></div>
          <div className="syllabus-table" role="table" aria-label="Course syllabus">
            <div className="syllabus-row syllabus-head" role="row"><span role="columnheader">Week / date</span><span role="columnheader">Class content</span></div>
            {courseClasses.map((classItem) => {
              const classMaterials = getMaterials(classItem.class_id)
              return <div className="syllabus-row" role="row" key={classItem.class_id}>
                <span className="week-cell" role="cell"><strong>W{String(classItem.week_number).padStart(2, '0')}</strong><small>{formatDate(classItem.date)}</small></span>
                <div className="class-cell" role="cell"><strong>{classItem.class_name.replace(/^Class \d+: /, '')}</strong>
                  {classMaterials.length ? <ul>{classMaterials.map((material) => <li key={material.material_id}><button type="button" className={selectedMaterial?.material_id === material.material_id ? 'active' : ''} onClick={() => setSelectedMaterial(material)}>{materialIcon(material.material_type)}<span>{material.material_title}</span><small>{material.material_type}</small></button></li>)}</ul> : <small className="materials-pending">Materials added during the course</small>}
                </div>
              </div>
            })}
          </div>
        </div>
      </aside>

      <section className="material-viewer" aria-live="polite">
        {!sidebarOpen && <button className="expand-sidebar" type="button" onClick={() => setSidebarOpen(true)}><Icons.Menu /> Course & syllabus</button>}
        {selectedMaterial ? <>
          <div className="viewer-toolbar"><span>{materialIcon(selectedMaterial.material_type)}<div><small>Now viewing</small><strong>{selectedMaterial.material_title}</strong></div></span><button type="button" onClick={() => setSelectedMaterial(null)}>Close material</button></div>
          <div className="viewer-content">
            {selectedMaterial.material_type === 'pdf' && <iframe src={lecturePdf} title={selectedMaterial.material_title} />}
            {selectedMaterial.material_type === 'video' && <video controls src={lectureVideo} aria-label={selectedMaterial.material_title}>Your browser does not support embedded video. <a href={lectureVideo}>Download the lecture video</a>.</video>}
            {selectedMaterial.material_type === 'youtube' && <iframe src={`https://www.youtube-nocookie.com/embed/${youtubeId}`} title={selectedMaterial.material_title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />}
            {selectedMaterial.material_type === 'md' && <MarkdownView text={assignmentText} />}
          </div>
        </> : <div className="course-cover"><img src={course.image_url} alt={`Course cover for ${course.name}`} /><div className="cover-overlay" /><div className="cover-caption"><p className="eyebrow">Palimpsest course archive</p><h2>{course.name}</h2><p>{course.short_description}</p><div><span>01</span><p>Select a material from the syllabus to begin studying.</p></div></div><small className="image-credit">Course image · Wikimedia Commons</small></div>}
      </section>
    </main>
  </div>
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(null)
  return selectedCourse
    ? <CoursePage course={selectedCourse} onBack={() => setSelectedCourse(null)} />
    : <Catalog onSelectCourse={setSelectedCourse} />
}
