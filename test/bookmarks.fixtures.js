function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Test Bookmark 1',
            url: 'https://somewebsite.com',
            rating: 2,
            description: 'All the sites!'
        },
        {
            id: 2,
            title: 'Test Bookmark 2',
            url: 'https://testwebsite2.com',
            rating: 4,
            description: 'All the webs!'
        },
        {
            id: 3,
            title: 'Test Bookmark 3',
            url: 'https://testwebsite3.com',
            rating: 5,
            description: 'All the compost!'
        },
    ]
}

module.exports = {
    makeBookmarksArray
}