/**
 * Shared composable for relationship dropdown options
 * Used across the application for consistent relationship selection
 */
export const useRelationshipOptions = () => {
  const relationshipOptions = [
    { value: '', label: 'Select relationship...' },
    { value: 'Me', label: 'Me - Account Owner' },
    { value: 'Aunt', label: 'Aunt' },
    { value: 'Brother', label: 'Brother' },
    { value: 'Brother-in-Law', label: 'Brother-in-Law' },
    { value: "Child's In-Law", label: "Child's In-Law" },
    { value: 'Cousin', label: 'Cousin' },
    { value: 'Daughter', label: 'Daughter' },
    { value: "Daughter's Father-in-Law", label: "Daughter's Father-in-Law" },
    { value: "Daughter's Mother-in-Law", label: "Daughter's Mother-in-Law" },
    { value: 'Daughter-in-Law', label: 'Daughter-in-Law' },
    { value: 'Ex-Husband', label: 'Ex-Husband' },
    { value: 'Ex-Wife', label: 'Ex-Wife' },
    { value: 'Father', label: 'Father' },
    { value: 'Father-in-Law', label: 'Father-in-Law' },
    { value: 'Friend', label: 'Friend' },
    { value: 'Grand Nephew', label: 'Grand Nephew' },
    { value: 'Grand Niece', label: 'Grand Niece' },
    { value: 'Granddaughter', label: 'Granddaughter' },
    { value: 'Grandfather', label: 'Grandfather' },
    { value: 'Grandmother', label: 'Grandmother' },
    { value: 'Grandson', label: 'Grandson' },
    { value: 'Great Aunt', label: 'Great Aunt' },
    { value: 'Great Granddaughter', label: 'Great Granddaughter' },
    { value: 'Great Grandfather', label: 'Great Grandfather' },
    { value: 'Great Grandmother', label: 'Great Grandmother' },
    { value: 'Great Grandson', label: 'Great Grandson' },
    { value: 'Great Uncle', label: 'Great Uncle' },
    { value: 'Great-Grand Nephew', label: 'Great-Grand Nephew' },
    { value: 'Great-Grand Niece', label: 'Great-Grand Niece' },
    { value: 'Great-Great Aunt', label: 'Great-Great Aunt' },
    { value: 'Great-Great Granddaughter', label: 'Great-Great Granddaughter' },
    { value: 'Great-Great Grandfather', label: 'Great-Great Grandfather' },
    { value: 'Great-Great Grandmother', label: 'Great-Great Grandmother' },
    { value: 'Great-Great Grandson', label: 'Great-Great Grandson' },
    { value: 'Great-Great Uncle', label: 'Great-Great Uncle' },
    { value: 'Half-Brother', label: 'Half-Brother' },
    { value: 'Half-Sister', label: 'Half-Sister' },
    { value: 'Husband', label: 'Husband' },
    { value: 'Mother', label: 'Mother' },
    { value: 'Mother-in-Law', label: 'Mother-in-Law' },
    { value: 'Nephew', label: 'Nephew' },
    { value: 'Niece', label: 'Niece' },
    { value: 'Other', label: 'Other' },
    { value: 'Sister', label: 'Sister' },
    { value: 'Sister-in-Law', label: 'Sister-in-Law' },
    { value: 'Son', label: 'Son' },
    { value: "Son's Father-in-Law", label: "Son's Father-in-Law" },
    { value: "Son's Mother-in-Law", label: "Son's Mother-in-Law" },
    { value: 'Son-in-Law', label: 'Son-in-Law' },
    { value: 'Stepbrother', label: 'Stepbrother' },
    { value: 'Stepdaughter', label: 'Stepdaughter' },
    { value: 'Stepfather', label: 'Stepfather' },
    { value: 'Stepmother', label: 'Stepmother' },
    { value: 'Stepsister', label: 'Stepsister' },
    { value: 'Stepson', label: 'Stepson' },
    { value: 'Uncle', label: 'Uncle' },
    { value: 'Wife', label: 'Wife' }
  ]

  return {
    relationshipOptions
  }
}

