// 代码模板数据
export interface CodeTemplate {
  id: string;
  title: string;
  description: string;
  code: string;
  category: string;
  subcategory: string;
}

export const codeTemplates: CodeTemplate[] = [
  // 入门类模板
  {
    id: 'hello-world',
    title: '你好世界',
    description: '最简单的Python程序，输出"Hello, World!"',
    code: `# 输出Hello, World!
print("Hello, World!")`,

    category: '入门',
    subcategory: '基础'
  },
  {
    id: 'variables',
    title: '变量定义',
    description: '演示如何定义和使用不同类型的变量',
    code: `# 变量定义示例
# 整数
age = 18
# 浮点数
height = 1.75
# 字符串
name = "Alice"
# 布尔值
is_student = True

# 输出变量
print(f"姓名: {name}")
print(f"年龄: {age}")
print(f"身高: {height}")
print(f"是否是学生: {is_student}")`,

    category: '入门',
    subcategory: '基础'
  },
  {
    id: 'loops',
    title: '循环结构',
    description: '演示for循环和while循环的使用',
    code: `# 循环结构示例
# for循环
print("For循环:")
for i in range(5):
    print(f"第{i+1}次循环")

# while循环
print("\nWhile循环:")
i = 0
while i < 5:
    print(f"第{i+1}次循环")
    i += 1`,

    category: '入门',
    subcategory: '控制流'
  },
  {
    id: 'conditions',
    title: '条件判断',
    description: '演示if-elif-else条件判断的使用',
    code: `# 条件判断示例
score = 85

if score >= 90:
    print("优秀")
elif score >= 80:
    print("良好")
elif score >= 60:
    print("及格")
else:
    print("不及格")`,

    category: '入门',
    subcategory: '控制流'
  },
  
  // 算法类模板
  {
    id: 'bubble-sort',
    title: '冒泡排序',
    description: '经典的冒泡排序算法实现',
    code: `# 冒泡排序算法
def bubble_sort(arr):
    n = len(arr)
    # 遍历所有数组元素
    for i in range(n):
        # 最后i个元素已经排好序
        for j in range(0, n-i-1):
            # 如果当前元素大于下一个元素，则交换它们
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr

# 测试
arr = [64, 34, 25, 12, 22, 11, 90]
print("排序前:", arr)
bubble_sort(arr)
print("排序后:", arr)`,

    category: '算法',
    subcategory: '排序'
  },
  {
    id: 'binary-search',
    title: '二分查找',
    description: '高效的二分查找算法实现',
    code: `# 二分查找算法
def binary_search(arr, target):
    left = 0
    right = len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        # 如果目标值等于中间元素，则找到
        if arr[mid] == target:
            return mid
        # 如果目标值小于中间元素，则在左半部分查找
        elif arr[mid] > target:
            right = mid - 1
        # 如果目标值大于中间元素，则在右半部分查找
        else:
            left = mid + 1
    
    # 如果没有找到目标值
    return -1

# 测试
arr = [2, 3, 4, 10, 40]
target = 10
result = binary_search(arr, target)
if result != -1:
    print(f"元素在索引 {result} 处找到")
else:
    print("元素未找到")`,

    category: '算法',
    subcategory: '搜索'
  },
  {
    id: 'fibonacci',
    title: '斐波那契数列',
    description: '使用递归和记忆化技术计算斐波那契数列',
    code: `# 斐波那契数列
def fib(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n
    memo[n] = fib(n-1, memo) + fib(n-2, memo)
    return memo[n]

# 测试
print("斐波那契数列前10项:")
for i in range(10):
    print(f"fib({i}) = {fib(i)}")`,

    category: '算法',
    subcategory: '递归'
  },
  
  // OOP类模板
  {
    id: 'class-and-inheritance',
    title: '类与继承',
    description: '演示Python的类定义和继承机制',
    code: `# 类与继承示例
class Animal:
    def __init__(self, name):
        self.name = name
    
    def speak(self):
        pass

class Dog(Animal):
    def speak(self):
        return f"{self.name} 说: 汪汪!"

class Cat(Animal):
    def speak(self):
        return f"{self.name} 说: 喵喵!"

# 测试
dog = Dog("旺财")
cat = Cat("咪咪")

print(dog.speak())
print(cat.speak())`,

    category: 'OOP',
    subcategory: '基础'
  },
  {
    id: 'encapsulation',
    title: '封装',
    description: '演示Python的封装特性',
    code: `# 封装示例
class Person:
    def __init__(self, name, age):
        self._name = name  # 私有属性（约定）
        self._age = age    # 私有属性（约定）
    
    def get_name(self):
        return self._name
    
    def set_name(self, name):
        self._name = name
    
    def get_age(self):
        return self._age
    
    def set_age(self, age):
        if age >= 0:
            self._age = age
        else:
            print("年龄不能为负数")

# 测试
person = Person("Alice", 20)
print(f"姓名: {person.get_name()}")
print(f"年龄: {person.get_age()}")

person.set_name("Bob")
person.set_age(25)
print(f"新姓名: {person.get_name()}")
print(f"新年龄: {person.get_age()}")`,

    category: 'OOP',
    subcategory: '高级'
  }
];

// 按分类和子分类组织模板
export const groupedTemplates = codeTemplates.reduce((groups, template) => {
  if (!groups[template.category]) {
    groups[template.category] = {};
  }
  if (!groups[template.category][template.subcategory]) {
    groups[template.category][template.subcategory] = [];
  }
  groups[template.category][template.subcategory].push(template);
  return groups;
}, {} as Record<string, Record<string, CodeTemplate[]>>);
