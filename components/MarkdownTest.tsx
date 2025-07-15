import React from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import MarkdownViewer from './MarkdownViewer';

const MarkdownTest: React.FC = () => {
  const markdownExamples = [
    {
      title: 'Basic Text',
      content: `# Heading 1
## Heading 2
### Heading 3

This is a **bold text** and this is *italic text*.

Here's some \`inline code\` and a [link](https://example.com).

> This is a blockquote with some important information.

- Bullet point 1
- Bullet point 2
- Bullet point 3

1. Numbered list item 1
2. Numbered list item 2
3. Numbered list item 3`
    },
    {
      title: 'Code Blocks',
      content: `Here's a code block:

\`\`\`javascript
function helloWorld() {
  console.log("Hello, World!");
  return "Hello from React Native!";
}

// Call the function
helloWorld();
\`\`\`

And some inline code: \`const x = 42;\``
    },
    {
      title: 'Tables',
      content: `| Name | Age | City |
|------|-----|------|
| John | 25  | NYC  |
| Jane | 30  | LA   |
| Bob  | 35  | SF   |

This table shows some sample data.`
    },
    {
      title: 'Lists and Formatting',
      content: `## Shopping List

### Groceries
- [ ] Milk
- [ ] Bread
- [ ] Eggs
- [x] Apples

### Electronics
1. **Laptop** - *High priority*
2. **Mouse** - Medium priority
3. **Keyboard** - Low priority

---

### Code Example
\`\`\`python
def calculate_sum(a, b):
    """Calculate the sum of two numbers"""
    return a + b

result = calculate_sum(5, 3)
print(f"The result is: {result}")
\`\`\``
    }
  ];

  const [selectedExample, setSelectedExample] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Markdown Viewer Test</Text>
      
      {/* Example Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorContainer}>
        {markdownExamples.map((example, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.selectorButton,
              selectedExample === index && styles.selectedButton
            ]}
            onPress={() => setSelectedExample(index)}
          >
            <Text style={[
              styles.selectorText,
              selectedExample === index && styles.selectedButtonText
            ]}>
              {example.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Markdown Content */}
      <ScrollView style={styles.contentContainer}>
        <MarkdownViewer 
          content={markdownExamples[selectedExample].content}
          style={styles.markdownContent}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f8fa',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B3A67',
    marginBottom: 16,
    textAlign: 'center',
  },
  selectorContainer: {
    marginBottom: 16,
  },
  selectorButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedButton: {
    backgroundColor: '#2B3A67',
    borderColor: '#2B3A67',
  },
  selectorText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedButtonText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  markdownContent: {
    flex: 1,
  },
});

export default MarkdownTest; 