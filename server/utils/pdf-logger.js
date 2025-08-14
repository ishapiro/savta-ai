// PDF Generation Logger - Provides summary logging instead of verbose step-by-step details

class PdfLogger {
  constructor(bookId, userId) {
    this.bookId = bookId
    this.userId = userId
    this.startTime = Date.now()
    this.steps = []
    this.errors = []
    this.warnings = []
  }

  // Log a step with optional details
  step(stepName, details = null) {
    const step = {
      name: stepName,
      timestamp: Date.now(),
      details
    }
    this.steps.push(step)
    
    // Only log major steps, not every detail
    if (this.isMajorStep(stepName)) {
      console.log(`📄 [PDF ${this.bookId}] ${stepName}`)
    }
  }

  // Log errors
  error(message, details = null) {
    this.errors.push({ message, details, timestamp: Date.now() })
    console.error(`❌ [PDF ${this.bookId}] ${message}`)
  }

  // Log warnings
  warning(message, details = null) {
    this.warnings.push({ message, details, timestamp: Date.now() })
    console.warn(`⚠️ [PDF ${this.bookId}] ${message}`)
  }

  // Log success
  success(message, details = null) {
    console.log(`✅ [PDF ${this.bookId}] ${message}`)
  }

  // Log summary at the end
  summary() {
    const duration = Date.now() - this.startTime
    const majorSteps = this.steps.filter(step => this.isMajorStep(step.name))
    
    console.log(`📊 [PDF ${this.bookId}] Generation Summary:`)
    console.log(`   ⏱️  Duration: ${duration}ms`)
    console.log(`   📋 Steps: ${majorSteps.length}`)
    console.log(`   ❌ Errors: ${this.errors.length}`)
    console.log(`   ⚠️  Warnings: ${this.warnings.length}`)
    
    if (majorSteps.length > 0) {
      console.log(`   📝 Major steps: ${majorSteps.map(s => s.name).join(' → ')}`)
    }
    
    if (this.errors.length > 0) {
      console.log(`   ❌ Errors: ${this.errors.map(e => e.message).join(', ')}`)
    }
  }

  // Determine if a step is major enough to log
  isMajorStep(stepName) {
    const majorSteps = [
      'Starting PDF generation',
      'Fetching assets',
      'Loading background',
      'Creating PDF document',
      'Processing photos',
      'Generating pages',
      'Saving PDF',
      'Uploading file',
      'PDF generation completed'
    ]
    return majorSteps.some(major => stepName.includes(major))
  }

  // Get all steps for debugging (but don't log them all)
  getAllSteps() {
    return this.steps
  }

  // Get errors for error handling
  getErrors() {
    return this.errors
  }

  // Get warnings for monitoring
  getWarnings() {
    return this.warnings
  }
}

export default PdfLogger
