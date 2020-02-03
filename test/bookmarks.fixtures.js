function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'Test Bookmark 1',
            url: 'https://somewebsite.com',
            rating: '2',
            description: 'All the sites!'
        },
        {
            id: 2,
            title: 'Test Bookmark 2',
            url: 'https://testwebsite2.com',
            rating: '4',
            description: 'All the webs!'
        },
        {
            id: 3,
            title: 'Test Bookmark 3',
            url: 'https://testwebsite3.com',
            rating: '5',
            description: 'All the compost!'
        },
    ]
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      url: 'https://www.hackers.com',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
      rating: 1,
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }
  
  module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
}