```
query {
  websites {
    identifier
    label
    url
    regexp
    tags
    active
  }
}
```
```
mutation {
  createWebsiteRecord(label: "Test Label", url: "https://www.example.com", regexp: ".*", tags: ["example", "test"], active: true) {
    success
    websiteRecord {
      identifier
      label
      url
      regexp
      tags
      active
    }
  }
}


```
Update
```
mutation {
  updateWebsiteRecord(identifier: 1, label: "Updated Label", active: false) {
    success
    websiteRecord {
      identifier
      label
      active
    }
  }
}


```

```
mutation {
  deleteWebsiteRecord(identifier: 1) {
    success
  }
}

```

https://github.com/MichalKyjovsky/nswi153/tree/master/backend/crawler/crawler