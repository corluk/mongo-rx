 

module.exports = {
    verbose: true,
    testMatch: [
        "**/?(*.)(test).[tj]s?(x)"
      ],
      "reporters": [
        "default",
        ["./node_modules/jest-html-reporter", {
            "pageTitle": "Test Report"
        }]
    ]
    
  };