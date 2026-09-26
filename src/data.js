import Papa from 'papaparse'

import coursesCsv from '../project-assets/history_courses.csv?raw'
import classesCsv from '../project-assets/history_classes.csv?raw'
import instructorsCsv from '../project-assets/history_instructors.csv?raw'
import materialsCsv from '../project-assets/course_materials.csv?raw'

const materialUrls = import.meta.glob('../project-assets/materials/*', {
  eager: true,
  query: '?url',
  import: 'default',
})

const markdownSources = import.meta.glob('../project-assets/materials/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
})

function parseCsv(source) {
  const normalizedSource = source.trim().replace(/\r\n?|\n/g, '\n')
  return Papa.parse(normalizedSource, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    newline: '\n',
  }).data
}

export const courses = parseCsv(coursesCsv)
export const classes = parseCsv(classesCsv)
export const instructors = parseCsv(instructorsCsv)
export const materials = parseCsv(materialsCsv)

export function getInstructor(instructorId) {
  return instructors.find((instructor) => instructor.instructor_id === instructorId)
}

export function getCourseClasses(courseId) {
  return classes.filter((classItem) => classItem.course_id === courseId)
}

export function getClassMaterials(classId) {
  return materials
    .filter((material) => material.class_id === classId)
    .sort((a, b) => a.display_order - b.display_order)
}

function materialAssetKey(filePath) {
  return `../project-assets/${filePath}`
}

export function getMaterialUrl(material) {
  if (/^https?:\/\//.test(material.file_path)) return material.file_path
  return materialUrls[materialAssetKey(material.file_path)]
}

export function getMarkdownSource(material) {
  return markdownSources[materialAssetKey(material.file_path)] || ''
}
