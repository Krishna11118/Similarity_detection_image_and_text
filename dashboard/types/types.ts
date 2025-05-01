export interface ImageComparisonData {
  _id: string
  queryUid: number
  comparedUid: string
  queryImagePath: string
  comparedImagePath: string
  similarityScore: number
  isSimilar: boolean
  processedAt: string
}

export interface FormData {
  _id: string
  uid: number
  projectName: string
  formTheme: string
  dateOfIdentification: string
  location: string
  gembaUnit: string
  category: string
  subCategory: string
  department: string
  currentSituation: string
  rootCause: string
  actionTaken: string
  standardization: string
  dateOfCompletion: string
  beforePicturePaths: string[]
  afterPicturePaths: string[]
  createdAt: string
}
