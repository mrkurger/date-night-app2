# BEM Naming Convention Guide for DateNight.io

This document provides guidelines for implementing the BEM (Block, Element, Modifier) naming convention in the DateNight.io application. Following these guidelines will ensure consistent and maintainable CSS across the application.

## Table of Contents

1. [Introduction to BEM](#introduction-to-bem)
2. [BEM Structure](#bem-structure)
3. [Naming Rules](#naming-rules)
4. [Examples](#examples)
5. [Best Practices](#best-practices)
6. [Integration with Emerald UI](#integration-with-emerald-ui)
7. [Common Mistakes to Avoid](#common-mistakes-to-avoid)

## Introduction to BEM

BEM (Block, Element, Modifier) is a naming convention for CSS classes that helps create reusable components and code sharing in front-end development. It provides a clear structure that is easy to understand and scale.

The main benefits of BEM include:

- **Modularity**: Each block is independent, allowing for code reuse
- **Reusability**: Blocks can be composed of other blocks
- **Structure**: Clear naming structure makes CSS more readable and maintainable
- **Scope**: Reduces style conflicts and specificity issues

## BEM Structure

BEM consists of three parts:

1. **Block**: A standalone entity that is meaningful on its own
2. **Element**: A part of a block that has no standalone meaning
3. **Modifier**: A flag on a block or element that changes appearance or behavior

### Syntax

```
.block {}
.block__element {}
.block--modifier {}
.block__element--modifier {}
```

## Naming Rules

1. **Block Names**:

   - Use lowercase letters
   - Use hyphens to separate words (kebab-case)
   - Should represent the component's purpose
   - Example: `.card`, `.user-profile`, `.search-form`

2. **Element Names**:

   - Connected to the block with double underscores (`__`)
   - Use lowercase letters
   - Use hyphens to separate words
   - Should represent the element's purpose within the block
   - Example: `.card__image`, `.user-profile__avatar`, `.search-form__input`

3. **Modifier Names**:
   - Connected to the block or element with double hyphens (`--`)
   - Use lowercase letters
   - Use hyphens to separate words
   - Should represent the modification
   - Example: `.card--featured`, `.button--primary`, `.search-form__input--disabled`

## Examples

### Basic Example

HTML:

```html
<div class="card">
  <Image class="card__image" src="image.jpg" alt="Card image" />
  <div class="card__content">
    <h2 class="card__title">Card Title</h2>
    <p class="card__text">Card description text</p>
  </div>
  <div class="card__actions">
    <button class="card__button card__button--primary">Primary Action</button>
    <button class="card__button card__button--secondary">Secondary Action</button>
  </div>
</div>
```

SCSS:

```scss
.card {
  border-radius: $border-radius-lg;
  box-shadow: $shadow-md;
  background-color: $color-white;

  &__image {
    width: 100%;
    border-top-left-radius: $border-radius-lg;
    border-top-right-radius: $border-radius-lg;
  }

  &__content {
    padding: $spacing-4;
  }

  &__title {
    font-size: $font-size-xl;
    margin-bottom: $spacing-2;
  }

  &__text {
    color: $color-dark-gray-1;
  }

  &__actions {
    display: flex;
    padding: $spacing-3 $spacing-4;
    border-top: 1px solid $color-light-gray-2;
  }

  &__button {
    padding: $spacing-2 $spacing-4;
    border-radius: $border-radius-md;
    font-weight: $font-weight-semibold;

    &--primary {
      background-color: $color-primary;
      color: $color-white;
    }

    &--secondary {
      background-color: transparent;
      color: $color-primary;
      border: 1px solid $color-primary;
    }
  }

  // Block modifier
  &--featured {
    border: 2px solid $color-primary;
    box-shadow: $shadow-lg;
  }
}
```

### Profile Card Example

HTML:

```html
<div class="profile-card profile-card--online">
  <div class="profile-card__header">
    <Image class="profile-card__avatar" src="avatar.jpg" alt="User avatar" />
    <div class="profile-card__status"></div>
  </div>
  <div class="profile-card__body">
    <h3 class="profile-card__name">John Doe</h3>
    <p class="profile-card__bio">Frontend Developer</p>
    <div class="profile-card__stats">
      <div class="profile-card__stat">
        <span class="profile-card__stat-value">42</span>
        <span class="profile-card__stat-label">Posts</span>
      </div>
      <div class="profile-card__stat">
        <span class="profile-card__stat-value">1.5k</span>
        <span class="profile-card__stat-label">Followers</span>
      </div>
    </div>
  </div>
  <div class="profile-card__footer">
    <button class="profile-card__button profile-card__button--primary">Follow</button>
    <button class="profile-card__button profile-card__button--secondary">Message</button>
  </div>
</div>
```

## Best Practices

1. **Keep blocks independent**:

   - A block should not depend on other blocks/elements on a page
   - Avoid using tag or ID selectors

2. **Keep elements within their block**:

   - Elements should always be part of a block, not another element
   - Avoid creating elements of elements (e.g., `.block__element1__element2`)

3. **Use modifiers appropriately**:

   - Use modifiers to change appearance, behavior, or state
   - Apply modifiers to both blocks and elements as needed

4. **Maintain flat structure**:

   - Avoid deep nesting of elements
   - If you need more than one level of elements, consider creating a new block

5. **Use mixins for common styles**:
   - Extract common styles into mixins to avoid duplication
   - Use the design system's typography and spacing mixins

## Integration with Emerald UI

When working with Emerald UI components, follow these guidelines:

1. **Wrapper Classes**:

   - Use BEM naming for wrapper elements around Emerald components
   - Example: `.user-profile__avatar-wrapper` containing an `<emerald-avatar>` component

2. **Component Host Elements**:

   - Apply BEM classes to component host elements
   - Example: `<emerald-card class="featured-content__card">`

3. **Custom Properties**:

   - Use BEM naming for custom properties passed to Emerald components
   - Example: `.user-card__custom-styles`

4. **Component Extensions**:
   - When extending Emerald components, follow BEM naming for the extended class
   - Example: `.emerald-button--custom`

## Common Mistakes to Avoid

1. **Excessive nesting**:

   - Avoid: `.card__header__title`
   - Better: `.card__header-title` or create a new block

2. **Overly generic names**:

   - Avoid: `.block__item`
   - Better: `.block__description`

3. **Inconsistent naming**:

   - Avoid mixing different naming conventions
   - Stick to kebab-case for all parts of BEM names

4. **Leaking styles**:

   - Avoid styling elements based on their context
   - Each block should be independent

5. **Overusing modifiers**:
   - Don't create a modifier for every small variation
   - Consider if a new block would be more appropriate

---

By following these BEM naming conventions, we'll create a more maintainable and consistent codebase for DateNight.io. This approach aligns with our UI/UX implementation plan and supports the integration of Emerald UI components.

Last Updated: 2025-05-15
