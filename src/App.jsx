import { useEffect, useMemo, useState } from 'react'
import { marked } from 'marked'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CirclePlay,
  Clock3,
  FileText,
  GraduationCap,
  Library,
  Map,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  UserRound,
  Video,
  X,
} from 'lucide-react'
import {
  courses,
  getClassMaterials,
  getCourseClasses,
  getInstructor,
  getMarkdownSource,
  getMaterialUrl,
} from './data'

const categories = [
  { label: 'All eras', value: 'all' },
  { label: 'Ancient', value: 'ancient' },
  { label: 'Medieval', value: 'medieval' },
  { label: 'Early modern', value: 'early-modern' },
  { label: 'Modern', value: 'modern' },
  { label: 'Global exchange', value: 'global' },
]

const categoryRules = {
  ancient: ['HIST101', 'HIST102', 'HIST103'],
  medieval: ['HIST104'],
  'early-modern': ['HIST105', 'HIST106', 'HIST112'],
  modern: ['HIST107', 'HIST108', 'HIST109', 'HIST110'],
  global: ['HIST106', 'HIST111', 'HIST112'],
}

const eraLabels = {
  HIST101: 'Ancient world', HIST102: 'Ancient world', HIST103: 'Ancient world',
  HIST104: 'Medieval world', HIST105: 'Early modern', HIST106: 'Global encounters',
  HIST107: 'Modern world', HIST108: 'Modern world', HIST109: '20th century',
  HIST110: '20th century', HIST111: 'Global exchange', HIST112: 'South Asia',
}

const materialMeta = {
  pdf: { icon: FileText, label: 'PDF reading' },
  video: { icon: CirclePlay, label: 'Lecture video' },
  youtube: { icon: Video, label: 'External video' },
  md: { icon: BookOpen, label: 'Assignment' },
}

function Logo({ onClick }) {
  return (
    <button className="brand" onClick={onClick} aria-label="Go to course catalog">
      <span className="brand-mark"><Library size={21} strokeWidth={1.8} /></span>
      <span className="brand-copy"><strong>Past Forward</strong><small>History, in context</small></span>
    </button>
  )
}

function Header({ view, onHome }) {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo onClick={onHome} />
        <nav className={`main-nav ${navOpen ? 'open' : ''}`} aria-label="Primary navigation">
          <button className={view === 'catalog' ? 'active' : ''} onClick={() => { onHome(); setNavOpen(false) }}>Courses</button>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}>Collections</button>
          <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
        </nav>
        <div className="header-actions">
          <span className="academic-tag"><Sparkles size={14} /> Autumn 2026</span>
          <button className="nav-toggle" onClick={() => setNavOpen(!navOpen)} aria-label="Toggle navigation">
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  )
}

function CourseCard({ course, onSelect, featured = false }) {
  const instructor = getInstructor(course.instructor_id)
  return (
    <article className={`course-card ${featured ? 'featured-card' : ''}`}>
      <button className="card-image" onClick={() => onSelect(course.course_id)} aria-label={`Open ${course.name}`}>
        <img src={course.image_url} alt="" />
        <span className="era-pill">{eraLabels[course.course_id]}</span>
        {featured && <span className="featured-pill">Featured course</span>}
      </button>
      <div className="card-body">
        <div className="course-code">{course.course_id}</div>
        <h3><button onClick={() => onSelect(course.course_id)}>{course.name}</button></h3>
        <p>{course.short_description}</p>
        <div className="card-footer">
          <span className="instructor-mini">
            <img src={instructor.photo_url} alt="" />
            {instructor.name}
          </span>
          <span className="course-length"><Clock3 size={15} /> {course.number_of_weeks} weeks</span>
        </div>
      </div>
    </article>
  )
}

function Catalog({ onSelect }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredCourses = useMemo(() => {
    const needle = search.toLowerCase().trim()
    return courses.filter((course) => {
      const matchesCategory = category === 'all' || categoryRules[category]?.includes(course.course_id)
      const instructor = getInstructor(course.instructor_id)
      const haystack = `${course.name} ${course.short_description} ${instructor?.name}`.toLowerCase()
      return matchesCategory && (!needle || haystack.includes(needle))
    })
  }, [search, category])

  const featured = courses.find((course) => course.course_id === 'HIST111')

  return (
    <main>
      <section className="hero">
        <div className="hero-ornament ornament-left" aria-hidden="true" />
        <div className="hero-ornament ornament-right" aria-hidden="true" />
        <div className="hero-inner">
          <p className="eyebrow"><span /> An archive of human experience <span /></p>
          <h1>History is not behind us.<br /><em>It explains us.</em></h1>
          <p className="hero-copy">Explore rigorous, story-rich courses that connect the people, ideas, and events of the past to the world we inhabit today.</p>
          <div className="search-box">
            <Search size={21} aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search eras, themes, or instructors..."
              aria-label="Search courses"
            />
            <kbd>⌘ K</kbd>
          </div>
          <div className="hero-stats" aria-label="Catalog statistics">
            <span><strong>{courses.length}</strong> courses</span>
            <i />
            <span><strong>5,000+</strong> years explored</span>
            <i />
            <span><strong>4</strong> historians</span>
          </div>
        </div>
      </section>

      <section className="featured-section section-shell" aria-labelledby="featured-heading">
        <div className="section-heading">
          <div><p className="kicker">Begin your journey</p><h2 id="featured-heading">Featured expedition</h2></div>
          <p>A guided path through one of history's great connective systems.</p>
        </div>
        <CourseCard course={featured} onSelect={onSelect} featured />
      </section>

      <section className="catalog-section" id="catalog" aria-labelledby="catalog-heading">
        <div className="section-shell">
          <div className="catalog-header">
            <div><p className="kicker">The course library</p><h2 id="catalog-heading">Choose your next chapter</h2></div>
            <span>{filteredCourses.length} {filteredCourses.length === 1 ? 'course' : 'courses'}</span>
          </div>
          <div className="filter-row" aria-label="Filter by historical era">
            {categories.map((item) => (
              <button
                key={item.value}
                className={category === item.value ? 'active' : ''}
                onClick={() => setCategory(item.value)}
              >{item.label}</button>
            ))}
          </div>
          {filteredCourses.length ? (
            <div className="course-grid">
              {filteredCourses.map((course) => <CourseCard key={course.course_id} course={course} onSelect={onSelect} />)}
            </div>
          ) : (
            <div className="empty-state"><Map size={34} /><h3>No courses found</h3><p>Try another keyword or explore a different era.</p></div>
          )}
        </div>
      </section>

      <section className="about-band" id="about">
        <div className="section-shell about-inner">
          <div className="about-mark"><GraduationCap size={30} /></div>
          <div><p className="kicker">Study with perspective</p><h2>More than dates. A way of seeing.</h2></div>
          <p>Past Forward brings primary sources, expert teaching, and global perspectives together in one thoughtful learning space.</p>
        </div>
      </section>
    </main>
  )
}

function MaterialButton({ material, isSelected, onClick }) {
  const meta = materialMeta[material.material_type] || materialMeta.pdf
  const Icon = meta.icon
  return (
    <button className={`material-link ${isSelected ? 'selected' : ''}`} onClick={onClick}>
      <span className="material-icon"><Icon size={17} /></span>
      <span><strong>{material.material_title}</strong><small>{meta.label}</small></span>
      <ChevronRight size={16} className="material-arrow" />
    </button>
  )
}

function Syllabus({ courseClasses, selectedMaterial, onMaterialSelect }) {
  return (
    <div className="syllabus-list">
      {courseClasses.map((classItem) => {
        const classMaterials = getClassMaterials(classItem.class_id)
        const title = classItem.class_name.replace(/^Class \d+:\s*/, '')
        return (
          <article className="class-row" key={classItem.class_id}>
            <div className="class-date">
              <span>Week {classItem.week_number}</span>
              <time dateTime={classItem.date}>{new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(new Date(`${classItem.date}T12:00:00`))}</time>
            </div>
            <div className="class-content">
              <p className="class-number">{classItem.class_name.match(/^Class \d+/)?.[0]}</p>
              <h3>{title}</h3>
              {classMaterials.length > 0 ? (
                <div className="material-list">
                  {classMaterials.map((material) => (
                    <MaterialButton
                      key={material.material_id}
                      material={material}
                      isSelected={selectedMaterial?.material_id === material.material_id}
                      onClick={() => onMaterialSelect(material)}
                    />
                  ))}
                </div>
              ) : <p className="materials-soon">Materials will be added before class.</p>}
            </div>
          </article>
        )
      })}
    </div>
  )
}

function YouTubeViewer({ material }) {
  const videoId = material.file_path.match(/youtu\.be\/([^?]+)/)?.[1]
  return (
    <div className="video-frame">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={material.material_title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}

function MaterialViewer({ course, material, onClose }) {
  if (!material) {
    return (
      <div className="course-cover-view">
        <img src={course.image_url} alt="Caravan crossing the Gobi Desert" />
        <div className="cover-scrim" />
        <div className="cover-caption">
          <p>Course field image</p>
          <h2>Across deserts, mountains, and seas</h2>
          <span>Select any class material to begin exploring.</span>
        </div>
      </div>
    )
  }

  const meta = materialMeta[material.material_type] || materialMeta.pdf
  const url = getMaterialUrl(material)
  const markdown = material.material_type === 'md' ? getMarkdownSource(material) : ''

  return (
    <div className="active-material">
      <div className="viewer-toolbar">
        <div><span>{meta.label}</span><strong>{material.material_title}</strong></div>
        <button onClick={onClose} aria-label="Close material"><X size={19} /></button>
      </div>
      <div className="viewer-body">
        {material.material_type === 'pdf' && <iframe src={url} title={material.material_title} className="document-frame" />}
        {material.material_type === 'video' && <video src={url} controls className="local-video" />}
        {material.material_type === 'youtube' && <YouTubeViewer material={material} />}
        {material.material_type === 'md' && (
          <article className="markdown-view" dangerouslySetInnerHTML={{ __html: marked.parse(markdown) }} />
        )}
      </div>
    </div>
  )
}

function CoursePage({ courseId, onBack }) {
  const course = courses.find((item) => item.course_id === courseId)
  const instructor = getInstructor(course.instructor_id)
  const courseClasses = getCourseClasses(courseId)
  const [selectedMaterial, setSelectedMaterial] = useState(null)
  const [collapsed, setCollapsed] = useState(() => window.innerWidth <= 760 && Boolean(selectedMaterial))

  const selectMaterial = (material) => {
    setSelectedMaterial(material)
    if (window.innerWidth <= 760) setCollapsed(true)
  }

  useEffect(() => window.scrollTo(0, 0), [])

  return (
    <main className="course-page">
      <div className="course-topbar">
        <button className="back-button" onClick={onBack}><ArrowLeft size={17} /> All courses</button>
        <span>{course.course_id}</span>
        <div className="course-progress"><span>Course progress</span><div><i /></div><strong>0%</strong></div>
      </div>
      <div className={`learning-layout ${collapsed ? 'collapsed' : ''}`}>
        <aside className="course-sidebar">
          <button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand course information' : 'Collapse course information'}>
            {collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>
          {!collapsed && (
            <div className="sidebar-scroll">
              <div className="course-intro">
                <p className="kicker">{eraLabels[course.course_id]} · {course.number_of_weeks} weeks</p>
                <h1>{course.name}</h1>
                <p>{course.long_description}</p>
                <div className="instructor-card">
                  <img src={instructor.photo_url} alt={instructor.name} />
                  <span><small>Your historian</small><strong>{instructor.name}</strong></span>
                  <UserRound size={18} />
                </div>
                <div className="course-facts">
                  <span><CalendarDays size={17} /><b>{course.number_of_classes}</b> classes</span>
                  <span><Clock3 size={17} /><b>{course.number_of_weeks}</b> weeks</span>
                </div>
              </div>
              <div className="syllabus-heading">
                <div><p className="kicker">Course path</p><h2>Syllabus</h2></div>
                <span>{course.number_of_classes} meetings</span>
              </div>
              <Syllabus courseClasses={courseClasses} selectedMaterial={selectedMaterial} onMaterialSelect={selectMaterial} />
            </div>
          )}
        </aside>
        <section className="material-panel" aria-label="Course material viewer">
          <MaterialViewer course={course} material={selectedMaterial} onClose={() => setSelectedMaterial(null)} />
          <button className="mobile-panel-toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {collapsed ? 'Show syllabus' : 'Focus on material'}
          </button>
        </section>
      </div>
    </main>
  )
}

export default function App() {
  const [selectedCourse, setSelectedCourse] = useState(() => window.location.hash.replace('#course/', '') || null)

  const openCourse = (courseId) => {
    setSelectedCourse(courseId)
    window.location.hash = `course/${courseId}`
  }

  const goHome = () => {
    setSelectedCourse(null)
    window.history.pushState(null, '', window.location.pathname)
    window.scrollTo(0, 0)
  }

  useEffect(() => {
    const onHashChange = () => setSelectedCourse(window.location.hash.replace('#course/', '') || null)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const validCourse = courses.some((course) => course.course_id === selectedCourse)

  return (
    <div className="app-shell">
      <Header view={validCourse ? 'course' : 'catalog'} onHome={goHome} />
      {validCourse ? <CoursePage courseId={selectedCourse} onBack={goHome} /> : <Catalog onSelect={openCourse} />}
      {!validCourse && <footer><Logo onClick={goHome} /><p>History, studied with care and curiosity.</p><span>© 2026 Past Forward</span></footer>}
    </div>
  )
}
