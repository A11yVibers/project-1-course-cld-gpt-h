import { useEffect, useMemo, useState } from 'react'
import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'
import assignmentMarkdown from '../project-assets/materials/silk_roads_class_02_assignment.md?raw'
import silkRoadsPdf from '../project-assets/materials/silk_roads_class_01_lecture.pdf?url'
import silkRoadsVideo from '../project-assets/materials/silk_roads_class_01_lecture.mp4?url'

function parseCsv(text) {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index]
    const next = text[index + 1]

    if (character === '"' && quoted && next === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell)
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }

  if (cell || row.length) {
    row.push(cell)
    rows.push(row)
  }

  const [headers, ...records] = rows
  return records.map((values) => Object.fromEntries(headers.map((header, index) => [header.trim(), values[index]?.trim() ?? ''])))
}

const courses = parseCsv(coursesCsv).map((course) => ({
  ...course,
  number_of_classes: Number(course.number_of_classes),
  number_of_weeks: Number(course.number_of_weeks),
}))
const classes = parseCsv(classesCsv)
const instructors = parseCsv(instructorsCsv)
const materials = parseCsv(materialsCsv).map((material) => ({ ...material, display_order: Number(material.display_order) }))

const materialAssetUrls = {
  'materials/silk_roads_class_01_lecture.pdf': silkRoadsPdf,
  'materials/silk_roads_class_01_lecture.mp4': silkRoadsVideo,
}

const Icon = ({ name, size = 18 }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.7-3.7"/></>,
    arrow: <><path d="m5 12 14 0"/><path d="m13 6 6 6-6 6"/></>,
    back: <><path d="m19 12-14 0"/><path d="m11 18-6-6 6-6"/></>,
    chevron: <path d="m9 18 6-6-6-6"/>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5v13Z"/><path d="M8 8h8"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    file: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5"/></>,
    play: <><circle cx="12" cy="12" r="9"/><path d="m10 8 6 4-6 4z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></>,
    panel: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></>,
    close: <><path d="m6 6 12 12M18 6 6 18"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  }
  return <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function Header({ onHome, compact = false }) {
  return (
    <header className={`site-header ${compact ? 'compact-header' : ''}`}>
      <button className="brand" onClick={onHome} aria-label="Go to course catalog">
        <span className="brand-mark"><span>H</span></span>
        <span><strong>HISTORIA</strong><small>THE PAST, PRESENT</small></span>
      </button>
      <nav aria-label="Primary navigation">
        <button className="nav-link active" onClick={onHome}>Explore</button>
        <span className="nav-link muted">About</span>
      </nav>
      <div className="header-actions">
        <button className="icon-button" aria-label="Search courses" onClick={onHome}><Icon name="search" /></button>
        <div className="avatar avatar-letter" aria-label="Student profile">A</div>
      </div>
    </header>
  )
}

function Catalog({ onSelectCourse }) {
  const [query, setQuery] = useState('')
  const [instructorFilter, setInstructorFilter] = useState('all')
  const [durationFilter, setDurationFilter] = useState('all')

  const courseRecords = useMemo(() => courses.map((course) => ({
    ...course,
    instructor: instructors.find((instructor) => instructor.instructor_id === course.instructor_id),
  })), [])

  const filteredCourses = courseRecords.filter((course) => {
    const needle = query.toLowerCase().trim()
    const matchesQuery = !needle || `${course.name} ${course.short_description} ${course.instructor?.name}`.toLowerCase().includes(needle)
    const matchesInstructor = instructorFilter === 'all' || course.instructor_id === instructorFilter
    const matchesDuration = durationFilter === 'all' || (durationFilter === 'short' ? course.number_of_weeks <= 5 : course.number_of_weeks >= 6)
    return matchesQuery && matchesInstructor && matchesDuration
  })

  return (
    <div className="catalog-page">
      <Header onHome={() => {}} />
      <section className="hero">
        <div className="hero-kicker"><span /> THE HISTORIA COURSE ARCHIVE</div>
        <h1>History is not behind us.<br/><em>It is beneath everything.</em></h1>
        <p>Explore defining eras, consequential lives, and ideas that still shape the world. Courses created for the endlessly curious.</p>
        <div className="search-wrap">
          <Icon name="search" size={22} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search an era, event, or idea..." aria-label="Search courses" />
          <span className="key-hint">⌘ K</span>
        </div>
        <div className="filter-row">
          <label>Instructor
            <select value={instructorFilter} onChange={(event) => setInstructorFilter(event.target.value)}>
              <option value="all">All historians</option>
              {instructors.map((instructor) => <option key={instructor.instructor_id} value={instructor.instructor_id}>{instructor.name}</option>)}
            </select>
          </label>
          <label>Duration
            <select value={durationFilter} onChange={(event) => setDurationFilter(event.target.value)}>
              <option value="all">Any length</option>
              <option value="short">5 weeks</option>
              <option value="long">6+ weeks</option>
            </select>
          </label>
          {(query || instructorFilter !== 'all' || durationFilter !== 'all') && <button className="clear-filters" onClick={() => { setQuery(''); setInstructorFilter('all'); setDurationFilter('all') }}>Clear filters</button>}
        </div>
      </section>

      <main className="catalog-main">
        <div className="catalog-heading">
          <div><span className="section-rule"/><p>THE COURSE CATALOG</p><h2>Choose your journey</h2></div>
          <span>{filteredCourses.length} {filteredCourses.length === 1 ? 'COURSE' : 'COURSES'}</span>
        </div>
        {filteredCourses.length ? (
          <div className="course-grid">
            {filteredCourses.map((course, index) => (
              <article className="course-card" key={course.course_id} onClick={() => onSelectCourse(course.course_id)}>
                <button aria-label={`Open ${course.name}`}>
                  <div className="course-image-wrap">
                    <img src={course.image_url} alt="" />
                    <span className="course-number">{String(index + 1).padStart(2, '0')}</span>
                    <span className="course-code">{course.course_id}</span>
                  </div>
                  <div className="course-card-body">
                    <div className="course-meta"><span>{course.number_of_weeks} WEEKS</span><i/><span>{course.number_of_classes} CLASSES</span></div>
                    <h3>{course.name}</h3>
                    <p>{course.short_description}</p>
                    <div className="instructor-row">
                      <img src={course.instructor?.photo_url} alt="" />
                      <span><small>LED BY</small><strong>{course.instructor?.name}</strong></span>
                      <span className="round-arrow"><Icon name="arrow" /></span>
                    </div>
                  </div>
                </button>
              </article>
            ))}
          </div>
        ) : <div className="empty-state"><span>NO RESULTS</span><h3>No histories found</h3><p>Try broadening your search or clearing the filters.</p></div>}
      </main>
      <footer><span>HISTORIA</span><p>A place to look back—and see further.</p><small>© 2026 HISTORIA LEARNING ARCHIVE</small></footer>
    </div>
  )
}

function MaterialIcon({ type }) {
  if (type === 'video' || type === 'youtube') return <Icon name="play" />
  if (type === 'md') return <Icon name="file" />
  return <Icon name="book" />
}

function MarkdownViewer({ markdown }) {
  const lines = markdown.split('\n')
  const content = []
  let list = []
  let table = []
  const flushList = () => {
    if (list.length) { content.push(<ol key={`list-${content.length}`}>{list.map((item, index) => <li key={index}>{inlineMarkdown(item)}</li>)}</ol>); list = [] }
  }
  const flushTable = () => {
    if (table.length) {
      const rows = table.filter((_, index) => index !== 1).map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
      content.push(<table key={`table-${content.length}`}><thead><tr>{rows[0].map((cell, index) => <th key={index}>{inlineMarkdown(cell)}</th>)}</tr></thead><tbody>{rows.slice(1).map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, index) => <td key={index}>{inlineMarkdown(cell)}</td>)}</tr>)}</tbody></table>)
      table = []
    }
  }

  lines.forEach((line, index) => {
    if (/^\|/.test(line)) { flushList(); table.push(line); return }
    flushTable()
    if (/^\d+\. /.test(line)) { list.push(line.replace(/^\d+\. /, '')); return }
    flushList()
    if (line.startsWith('# ')) content.push(<h1 key={index}>{line.slice(2)}</h1>)
    else if (line.startsWith('## ')) content.push(<h2 key={index}>{line.slice(3)}</h2>)
    else if (line.trim()) content.push(<p key={index}>{inlineMarkdown(line)}</p>)
  })
  flushList(); flushTable()
  return <div className="markdown-document">{content}</div>
}

function inlineMarkdown(text) {
  const pieces = text.split(/(\*\*[^*]+\*\*)/g)
  return pieces.map((piece, index) => piece.startsWith('**') ? <strong key={index}>{piece.slice(2, -2)}</strong> : piece)
}

function MaterialViewer({ material, course }) {
  if (!material) {
    return (
      <div className="course-cover-view">
        <img src={course.image_url} alt="A caravan crossing the Gobi Desert" />
        <div className="cover-shade" />
        <div className="cover-caption"><span>FEATURED COURSE</span><h2>{course.name}</h2><p>Select a course material from the syllabus to begin.</p></div>
      </div>
    )
  }

  const source = materialAssetUrls[material.file_path] || material.file_path
  const youtubeId = material.material_type === 'youtube' ? material.file_path.match(/youtu\.be\/([^?]+)/)?.[1] : null

  return (
    <div className="material-view">
      <div className="viewer-toolbar">
        <div><MaterialIcon type={material.material_type}/><span><small>{material.material_type === 'md' ? 'ASSIGNMENT' : material.material_type.toUpperCase()}</small><strong>{material.material_title}</strong></span></div>
        {material.material_type !== 'video' && <a href={source} target="_blank" rel="noreferrer" aria-label="Open material in new tab"><Icon name="link" /></a>}
      </div>
      <div className="viewer-body">
        {material.material_type === 'pdf' && <iframe title={material.material_title} src={`${source}#toolbar=0&navpanes=0`} />}
        {material.material_type === 'video' && <div className="video-shell"><video controls src={source}><track kind="captions" /></video><div><span>LECTURE RECORDING</span><h3>{material.material_title}</h3></div></div>}
        {material.material_type === 'youtube' && <div className="youtube-shell"><iframe title={material.material_title} src={`https://www.youtube.com/embed/${youtubeId}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>}
        {material.material_type === 'md' && <MarkdownViewer markdown={assignmentMarkdown} />}
      </div>
    </div>
  )
}

function CoursePage({ courseId, onBack }) {
  const course = courses.find((item) => item.course_id === courseId)
  const instructor = instructors.find((item) => item.instructor_id === course?.instructor_id)
  const courseClasses = classes.filter((item) => item.course_id === courseId)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => { setSelectedMaterial(null); setSidebarOpen(true) }, [courseId])
  if (!course) return null

  return (
    <div className="course-page">
      <Header onHome={onBack} compact />
      <div className={`course-workspace ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
        <aside className="course-sidebar">
          <button className="back-button" onClick={onBack}><Icon name="back" /> ALL COURSES</button>
          <button className="collapse-button" onClick={() => setSidebarOpen(false)} aria-label="Collapse course information"><Icon name="panel" /></button>
          <div className="course-intro">
            <span className="eyebrow">{course.course_id} · FALL 2026</span>
            <h1>{course.name}</h1>
            <p>{course.long_description}</p>
            <div className="course-facts"><span><Icon name="calendar"/><b>{course.number_of_weeks}</b><small>WEEKS</small></span><span><Icon name="book"/><b>{course.number_of_classes}</b><small>CLASSES</small></span></div>
            <div className="instructor-profile"><img src={instructor?.photo_url} alt={instructor?.name}/><span><small>YOUR HISTORIAN</small><strong>{instructor?.name}</strong><a href={`mailto:${instructor?.email}`}>{instructor?.email}</a></span></div>
          </div>
          <section className="syllabus">
            <div className="syllabus-title"><span>COURSE SYLLABUS</span><small>{courseClasses.length} CLASSES</small></div>
            <div className="syllabus-table-head"><span>WK</span><span>DATE</span><span>CLASS CONTENT</span></div>
            <div className="class-list">
              {courseClasses.map((classItem) => {
                const classMaterials = materials.filter((material) => material.class_id === classItem.class_id).sort((a, b) => a.display_order - b.display_order)
                const title = classItem.class_name.replace(/^Class \d+: /, '')
                return (
                  <div className={`class-row ${classMaterials.length ? 'has-materials' : ''}`} key={classItem.class_id}>
                    <div className="week-number">{String(classItem.week_number).padStart(2, '0')}</div>
                    <time dateTime={classItem.date}>{new Date(`${classItem.date}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}</time>
                    <div className="class-content"><span className="class-index">{classItem.class_name.match(/^Class \d+/)?.[0]}</span><h3>{title}</h3>
                      {classMaterials.length > 0 && <div className="material-list">{classMaterials.map((material) => (
                        <button className={selectedMaterial?.material_id === material.material_id ? 'selected' : ''} key={material.material_id} onClick={() => setSelectedMaterial(material)}>
                          <span><MaterialIcon type={material.material_type}/></span><span><small>{material.material_type === 'md' ? 'ASSIGNMENT' : material.material_type.toUpperCase()}</small>{material.material_title}</span><Icon name="chevron" size={15}/>
                        </button>
                      ))}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </aside>
        {!sidebarOpen && <button className="expand-button" onClick={() => setSidebarOpen(true)}><Icon name="panel" /><span>OPEN COURSE</span></button>}
        <main className="viewer-pane"><MaterialViewer material={selectedMaterial} course={course}/></main>
      </div>
    </div>
  )
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(() => window.location.hash.replace('#course/', '') || null)

  const selectCourse = (courseId) => {
    setSelectedCourse(courseId)
    window.location.hash = `course/${courseId}`
    window.scrollTo(0, 0)
  }
  const goHome = () => {
    setSelectedCourse(null)
    window.history.pushState('', document.title, window.location.pathname + window.location.search)
    window.scrollTo(0, 0)
  }

  return selectedCourse ? <CoursePage courseId={selectedCourse} onBack={goHome} /> : <Catalog onSelectCourse={selectCourse} />
}
