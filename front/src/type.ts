export interface Serie {
    tconst: string
    titleType: string
    primaryTitle: string
    startYear: number
    endYear: number
    genres: string
    averageRating: number
    numVotes: number
}

export interface Episode {
    tconst: string
    seasonNumber: number
    episodeNumber: number
    averageRating: number
    numVotes: number
}