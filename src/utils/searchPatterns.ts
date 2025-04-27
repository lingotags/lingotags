export const searchPatterns: RegExp[] = [
  // HTML and JSX tags with multi-line support using [\s\S] instead of .
  /<(h1|h2|h3|h4|h5|h6|p|li|blockquote|span|label|strong|em|a|button|small|b|i)[^>]*>([\s\S]*?)<\/\1>/g,

  // JSX component tags (capitalized first letter)
  /<([A-Z][a-zA-Z]*)[^>]*>([\s\S]*?)<\/\1>/g,
  
  // Shadcn components with multi-line support
  /<Card(Title|Description|Footer)[^>]*>([\s\S]*?)<\/Card\1>/g,
  /<Alert(Title|Description)[^>]*>([\s\S]*?)<\/Alert\1>/g,
  /<Toast(Title|Description)[^>]*>([\s\S]*?)<\/Toast\1>/g,
  /<Dialog(Title|Description)[^>]*>([\s\S]*?)<\/Dialog\1>/g,
  /<Tooltip(Content)[^>]*>([\s\S]*?)<\/Tooltip\1>/g,
  /<DropdownMenu(Item|Trigger)[^>]*>([\s\S]*?)<\/DropdownMenu\1>/g,
  /<Tab(Trigger)[^>]*>([\s\S]*?)<\/Tab\1>/g,
  /<Accordion(Trigger|Content)[^>]*>([\s\S]*?)<\/Accordion\1>/g,
  /<Label[^>]*>([\s\S]*?)<\/Label>/g,
  /<Button[^>]*>([\s\S]*?)<\/Button>/g,
  /<Breadcrumb(Item)[^>]*>([\s\S]*?)<\/Breadcrumb\1>/g,
  /<Badge[^>]*>([\s\S]*?)<\/Badge>/g,
  /<AvatarFallback[^>]*>([\s\S]*?)<\/AvatarFallback>/g,
  /<NavLink[^>]*>([\s\S]*?)<\/NavLink>/g,
  /<Progress[^>]*>([\s\S]*?)<\/Progress>/g,
  /<Input[^>]*>([\s\S]*?)<\/Input>/g,
  /<Select(Item|Trigger|Content)[^>]*>([\s\S]*?)<\/Select\1>/g,
  /<Textarea[^>]*>([\s\S]*?)<\/Textarea>/g,
];
