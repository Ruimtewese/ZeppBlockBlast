import {
  createWidget,
  widget,
  align,
  text_style,
  event,
  prop,
  createKeyboard,
  inputType,
  deleteKeyboard,
  deleteWidget,
  setStatusBarVisible
} from "@zos/ui";


/* =========================================================
 * ZEPPCORE UI
 * ========================================================= */

const theme = {
  background: 0x000000,

  surface: 0x111827,
  surface2: 0x1e293b,

  accent: 0x20a0f5,
  accentPressed: 0x1786d0,

  text: 0xffffff,
  textMuted: 0x94a3b8,

  success: 0x80cfa0,
  warning: 0xf2c879,
  danger: 0xf28c8c,

  border: 0x334155,

  radius: 24
};


/* =========================================================
 * THEME
 * ========================================================= */

export function configureTheme(options = {}) {
  Object.assign(theme, options);
}


export function getTheme() {
  return {
    ...theme
  };
}


/* =========================================================
 * STATUS BAR
 * ========================================================= */

export function hideStatusBar() {
  setStatusBarVisible(false);
}


export function showStatusBar() {
  setStatusBarVisible(true);
}


export function setStatusBar(visible) {
  setStatusBarVisible(
    Boolean(visible)
  );
}


export function setupPage(options = {}) {
  const {
    hideStatusBar:
      shouldHideStatusBar = true
  } = options;

  setStatusBarVisible(
    !shouldHideStatusBar
  );
}


/* =========================================================
 * ALIGNMENT
 * ========================================================= */

export function horizontalAlign(
  value = "center"
) {
  if (typeof value === "number") {
    return value;
  }

  switch (
    String(value).toLowerCase()
  ) {
    case "left":
      return align.LEFT;

    case "right":
      return align.RIGHT;

    default:
      return align.CENTER_H;
  }
}


export function verticalAlign(
  value = "center"
) {
  if (typeof value === "number") {
    return value;
  }

  switch (
    String(value).toLowerCase()
  ) {
    case "top":
      return align.TOP;

    case "bottom":
      return align.BOTTOM;

    default:
      return align.CENTER_V;
  }
}


/* =========================================================
 * TEXT
 * ========================================================= */

export function text(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 40,

    value = "",

    color = theme.text,
    size = 24,

    alignH = align.CENTER_H,
    alignV = align.CENTER_V,

    style = text_style.NONE,

    font,
    textW,
    lineSpace,
    charSpace
  } = options;

  const params = {
    x,
    y,
    w,
    h,

    text: String(value),

    color,
    text_size: size,

    align_h: alignH,
    align_v: alignV,

    text_style: style
  };

  if (font !== undefined) {
    params.font = font;
  }

  if (textW !== undefined) {
    params.text_w = textW;
  }

  if (lineSpace !== undefined) {
    params.line_space = lineSpace;
  }

  if (charSpace !== undefined) {
    params.char_space = charSpace;
  }

  return createWidget(
    widget.TEXT,
    params
  );
}


/* =========================================================
 * PILL TEXT
 * ========================================================= */

export function pillText(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 60,

    value = "",

    horizontal = "center",
    vertical = "center",

    paddingX = 0,
    paddingY = 0,

    color = theme.text,
    size = 24,

    style = text_style.NONE,

    font
  } = options;

  const safePaddingX =
    Math.max(0, paddingX);

  const safePaddingY =
    Math.max(0, paddingY);

  return text({
    x:
      x + safePaddingX,

    y:
      y + safePaddingY,

    w:
      Math.max(
        1,
        w - safePaddingX * 2
      ),

    h:
      Math.max(
        1,
        h - safePaddingY * 2
      ),

    value,

    color,
    size,

    alignH:
      horizontalAlign(horizontal),

    alignV:
      verticalAlign(vertical),

    style,
    font
  });
}


/* =========================================================
 * BUTTON
 * ========================================================= */

export function button(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 60,

    text: label = "",

    color = theme.text,
    textSize = 24,

    normalColor = theme.accent,
    pressColor = theme.accentPressed,

    radius = 20,

    onClick = null,
    onLongPress = null,

    font,
    textW
  } = options;

  const params = {
    x,
    y,

    w,
    h,

    text: String(label),

    color,

    text_size: textSize,

    normal_color: normalColor,
    press_color: pressColor,

    radius
  };

  if (onClick) {
    params.click_func = onClick;
  }

  if (onLongPress) {
    params.longpress_func = onLongPress;
  }

  if (font !== undefined) {
    params.font = font;
  }

  if (textW !== undefined) {
    params.text_w = textW;
  }

  return createWidget(
    widget.BUTTON,
    params
  );
}


/* =========================================================
 * PILL
 * ========================================================= */

export function pill(options = {}) {
  const {
    h = 60
  } = options;

  return button({
    ...options,

    h,

    radius:
      Math.floor(h / 2)
  });
}


/* =========================================================
 * ALIGNED PILL
 * ========================================================= */

export function pillAligned(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 60,

    text: label = "",

    horizontal = "center",
    vertical = "center",

    paddingX = 0,
    paddingY = 0,

    textColor = theme.text,
    textSize = 24,

    normalColor = theme.accent,
    pressColor = theme.accentPressed,

    radius =
      Math.floor(h / 2),

    font,

    onClick = null
  } = options;

  const background =
    createWidget(
      widget.FILL_RECT,
      {
        x,
        y,

        w,
        h,

        color:
          normalColor,

        radius,

        alpha: 255
      }
    );

  const labelWidget =
    pillText({
      x,
      y,

      w,
      h,

      value: label,

      horizontal,
      vertical,

      paddingX,
      paddingY,

      color:
        textColor,

      size:
        textSize,

      font
    });

  function setPressed(pressed) {
    background.setProperty(
      prop.MORE,
      {
        x,
        y,

        w,
        h,

        color:
          pressed
            ? pressColor
            : normalColor,

        radius
      }
    );
  }

  /*
   * The label sits above the background and can receive
   * the touch itself. Registering the handlers on the label
   * makes the whole pill reliably clickable on-device,
   * including when the user taps directly on the text.
   */
  labelWidget.addEventListener(
    event.CLICK_DOWN,
    () => {
      setPressed(true);
    }
  );

  labelWidget.addEventListener(
    event.CLICK_UP,
    () => {
      setPressed(false);

      if (onClick) {
        onClick(background);
      }
    }
  );

  function setText(newText) {
    labelWidget.setProperty(
      prop.MORE,
      {
        text:
          String(newText)
      }
    );
  }

  return {
    button: background,
    text: labelWidget,
    setText
  };
}


/* =========================================================
 * ICON BUTTON
 * ========================================================= */

export function iconButton(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 60,
    h = 60,

    normalSrc,
    pressSrc,

    onClick = null,
    onLongPress = null
  } = options;

  const params = {
    x,
    y,

    w,
    h,

    normal_src:
      normalSrc,

    press_src:
      pressSrc
  };

  if (onClick) {
    params.click_func = onClick;
  }

  if (onLongPress) {
    params.longpress_func =
      onLongPress;
  }

  return createWidget(
    widget.BUTTON,
    params
  );
}


/* =========================================================
 * CARD
 * ========================================================= */

export function card(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 100,

    color = theme.surface,

    radius = theme.radius,

    onClick = null
  } = options;

  const result =
    createWidget(
      widget.FILL_RECT,
      {
        x,
        y,

        w,
        h,

        color,
        radius
      }
    );

  if (onClick) {
    result.addEventListener(
      event.CLICK_UP,
      onClick
    );
  }

  return result;
}


/* =========================================================
 * OUTLINE CARD
 * ========================================================= */

export function outlineCard(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 100,

    color = theme.border,

    radius = theme.radius,

    lineWidth = 2,

    onClick = null
  } = options;

  const result =
    createWidget(
      widget.STROKE_RECT,
      {
        x,
        y,

        w,
        h,

        color,
        radius,

        line_width:
          lineWidth
      }
    );

  if (onClick) {
    result.addEventListener(
      event.CLICK_UP,
      onClick
    );
  }

  return result;
}


/* =========================================================
 * DIVIDER
 * ========================================================= */

export function divider(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 2,

    color = theme.border
  } = options;

  return createWidget(
    widget.FILL_RECT,
    {
      x,
      y,

      w,
      h,

      color,

      radius:
        Math.floor(
          Math.min(w, h) / 2
        )
    }
  );
}


/* =========================================================
 * IMAGE
 * ========================================================= */

export function image(options = {}) {
  const {
    x = 0,
    y = 0,

    src,

    w,
    h,

    posX,
    posY,

    angle,
    centerX,
    centerY,

    alpha,
    autoScale,
    fit
  } = options;

  const params = {
    x,
    y,
    src
  };

  if (w !== undefined) {
    params.w = w;
  }

  if (h !== undefined) {
    params.h = h;
  }

  if (posX !== undefined) {
    params.pos_x = posX;
  }

  if (posY !== undefined) {
    params.pos_y = posY;
  }

  if (angle !== undefined) {
    params.angle = angle;
  }

  if (centerX !== undefined) {
    params.center_x = centerX;
  }

  if (centerY !== undefined) {
    params.center_y = centerY;
  }

  if (alpha !== undefined) {
    params.alpha = alpha;
  }

  if (autoScale !== undefined) {
    params.auto_scale = autoScale;
  }

  if (fit !== undefined) {
    params.auto_scale_obj_fit = fit;
  }

  return createWidget(
    widget.IMG,
    params
  );
}


/* =========================================================
 * CIRCLE
 * ========================================================= */

export function circle(options = {}) {
  const {
    centerX = 0,
    centerY = 0,

    radius = 10,

    color = theme.accent,

    alpha = 255
  } = options;

  return createWidget(
    widget.CIRCLE,
    {
      center_x: centerX,
      center_y: centerY,

      radius,

      color,
      alpha
    }
  );
}


/* =========================================================
 * ARC
 * ========================================================= */

export function arc(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 200,

    radius = 80,

    startAngle = -90,
    endAngle = 90,

    lineWidth = 10,

    color = theme.accent
  } = options;

  return createWidget(
    widget.ARC,
    {
      x,
      y,

      w,
      h,

      radius,

      start_angle:
        startAngle,

      end_angle:
        endAngle,

      line_width:
        lineWidth,

      color
    }
  );
}


/* =========================================================
 * PROGRESS BAR
 * ========================================================= */

export function progressBar(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 300,
    h = 20,

    value = 0,
    max = 100,

    backgroundColor =
      theme.surface2,

    fillColor =
      theme.accent,

    radius =
      Math.floor(h / 2)
  } = options;

  const background =
    createWidget(
      widget.FILL_RECT,
      {
        x,
        y,

        w,
        h,

        color:
          backgroundColor,

        radius
      }
    );

  const fill =
    createWidget(
      widget.FILL_RECT,
      {
        x,
        y,

        w:
          calculatePercentageWidth(
            w,
            value,
            max
          ),

        h,

        color:
          fillColor,

        radius
      }
    );

  function setValue(newValue) {
    const safeValue =
      clamp(
        newValue,
        0,
        max
      );

    fill.setProperty(
      prop.MORE,
      {
        x,
        y,

        w:
          calculatePercentageWidth(
            w,
            safeValue,
            max
          ),

        h
      }
    );
  }

  return {
    background,
    fill,
    setValue
  };
}


/* =========================================================
 * CIRCULAR PROGRESS
 * ========================================================= */

export function progressCircle(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    size = 200,

    value = 0,
    max = 100,

    startAngle = -90,
    totalAngle = 360,

    lineWidth = 18,

    color = theme.accent
  } = options;

  const safeMax =
    Math.max(
      1,
      max
    );

  const progress =
    createWidget(
      widget.ARC,
      {
        x,
        y,

        w: size,
        h: size,

        radius:
          Math.floor(
            size / 2
          ),

        start_angle:
          startAngle,

        end_angle:
          startAngle +
          (
            clamp(
              value,
              0,
              safeMax
            ) /
            safeMax
          ) *
          totalAngle,

        line_width:
          lineWidth,

        color
      }
    );

  function setValue(newValue) {
    const safeValue =
      clamp(
        newValue,
        0,
        safeMax
      );

    progress.setProperty(
      prop.MORE,
      {
        x,
        y,

        w: size,
        h: size,

        radius:
          Math.floor(
            size / 2
          ),

        start_angle:
          startAngle,

        end_angle:
          startAngle +
          (
            safeValue /
            safeMax
          ) *
          totalAngle,

        line_width:
          lineWidth,

        color
      }
    );
  }

  return {
    widget: progress,
    setValue
  };
}


/* =========================================================
 * QR CODE
 * ========================================================= */

export function qrCode(options = {}) {
  const {
    x = 0,
    y = 0,

    w = 200,
    h = 200,

    content = "",

    backgroundX = x,
    backgroundY = y,

    backgroundW = w,
    backgroundH = h,

    backgroundRadius = 0
  } = options;

  return createWidget(
    widget.QRCODE,
    {
      content,

      x,
      y,

      w,
      h,

      bg_x:
        backgroundX,

      bg_y:
        backgroundY,

      bg_w:
        backgroundW,

      bg_h:
        backgroundH,

      bg_radius:
        backgroundRadius
    }
  );
}


/* =========================================================
 * SWITCH
 * ========================================================= */

export function switchControl(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 130,
    h = 58,

    value = false,

    onColor = theme.accent,
    offColor = theme.surface2,

    pressedOnColor =
      theme.accentPressed,

    pressedOffColor =
      theme.border,

    onText = "ON",
    offText = "OFF",

    textColor = theme.text,
    textSize = 20,

    font,

    radius =
      Math.floor(h / 2),

    onChange = null
  } = options;

  let checked =
    Boolean(value);

  const control =
    createWidget(
      widget.BUTTON,
      {
        x,
        y,

        w,
        h,

        text:
          checked
            ? onText
            : offText,

        color:
          textColor,

        text_size:
          textSize,

        ...(font !== undefined
          ? { font }
          : {}),

        normal_color:
          checked
            ? onColor
            : offColor,

        press_color:
          checked
            ? pressedOnColor
            : pressedOffColor,

        radius,

        click_func: () => {
          checked =
            !checked;

          update();

          if (onChange) {
            onChange(
              checked,
              control
            );
          }
        }
      }
    );

  function update() {
    control.setProperty(
      prop.MORE,
      {
        x,
        y,

        w,
        h,

        text:
          checked
            ? onText
            : offText,

        color:
          textColor,

        text_size:
          textSize,

        ...(font !== undefined
          ? { font }
          : {}),

        normal_color:
          checked
            ? onColor
            : offColor,

        press_color:
          checked
            ? pressedOnColor
            : pressedOffColor,

        radius
      }
    );
  }

  function setValue(
    newValue,
    notify = false
  ) {
    checked =
      Boolean(newValue);

    update();

    if (
      notify &&
      onChange
    ) {
      onChange(
        checked,
        control
      );
    }
  }

  function getValue() {
    return checked;
  }

  return {
    widget: control,
    getValue,
    setValue
  };
}


/* =========================================================
 * CHECKBOX
 * ========================================================= */

export function checkbox(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 70,
    h = 60,

    value = false,

    checkedText = "✓",
    uncheckedText = "□",

    checkedColor =
      theme.accent,

    uncheckedColor =
      theme.surface2,

    textColor =
      theme.text,

    textSize = 28,

    font,

    radius = 14,

    onChange = null
  } = options;

  let checked =
    Boolean(value);

  const control =
    createWidget(
      widget.BUTTON,
      {
        x,
        y,

        w,
        h,

        text:
          checked
            ? checkedText
            : uncheckedText,

        color:
          textColor,

        text_size:
          textSize,

        ...(font !== undefined
          ? { font }
          : {}),

        normal_color:
          checked
            ? checkedColor
            : uncheckedColor,

        press_color:
          checked
            ? checkedColor
            : theme.border,

        radius,

        click_func: () => {
          checked =
            !checked;

          update();

          if (onChange) {
            onChange(
              checked,
              control
            );
          }
        }
      }
    );

  function update() {
    control.setProperty(
      prop.MORE,
      {
        x,
        y,

        w,
        h,

        text:
          checked
            ? checkedText
            : uncheckedText,

        color:
          textColor,

        text_size:
          textSize,

        normal_color:
          checked
            ? checkedColor
            : uncheckedColor,

        press_color:
          checked
            ? checkedColor
            : theme.border,

        radius
      }
    );
  }

  function setValue(
    newValue,
    notify = false
  ) {
    checked =
      Boolean(newValue);

    update();

    if (
      notify &&
      onChange
    ) {
      onChange(
        checked,
        control
      );
    }
  }

  function getValue() {
    return checked;
  }

  return {
    widget: control,
    getValue,
    setValue
  };
}


/* =========================================================
 * RADIO GROUP
 * ========================================================= */

export function radioGroup(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 300,

    itemHeight = 60,
    itemSpacing = 10,

    options: values = [],

    selected = 0,

    selectedColor =
      theme.accent,

    unselectedColor =
      theme.surface2,

    textColor =
      theme.text,

    textSize = 22,

    font,

    radius = 20,

    onChange = null
  } = options;

  let currentIndex =
    clamp(
      selected,
      0,
      Math.max(
        0,
        values.length - 1
      )
    );

  const controls = [];

  values.forEach(
    (value, index) => {

      const control =
        createWidget(
          widget.BUTTON,
          {
            x,

            y:
              y +
              index *
                (
                  itemHeight +
                  itemSpacing
                ),

            w,

            h:
              itemHeight,

            text:
              index === currentIndex
                ? `● ${value}`
                : `○ ${value}`,

            color:
              textColor,

            text_size:
              textSize,

            ...(font !== undefined
              ? { font }
              : {}),

            normal_color:
              index === currentIndex
                ? selectedColor
                : unselectedColor,

            press_color:
              selectedColor,

            radius,

            click_func: () => {

              currentIndex =
                index;

              update();

              if (onChange) {
                onChange(
                  currentIndex,
                  values[
                    currentIndex
                  ],
                  control
                );
              }
            }
          }
        );

      controls.push(
        control
      );
    }
  );

  function update() {
    controls.forEach(
      (control, index) => {

        control.setProperty(
          prop.MORE,
          {
            x,

            y:
              y +
              index *
                (
                  itemHeight +
                  itemSpacing
                ),

            w,

            h:
              itemHeight,

            text:
              index === currentIndex
                ? `● ${values[index]}`
                : `○ ${values[index]}`,

            color:
              textColor,

            text_size:
              textSize,

            ...(font !== undefined
              ? { font }
              : {}),

            normal_color:
              index === currentIndex
                ? selectedColor
                : unselectedColor,

            press_color:
              selectedColor,

            radius
          }
        );
      }
    );
  }

  function getValue() {
    return values[
      currentIndex
    ];
  }

  function getIndex() {
    return currentIndex;
  }

  function setValue(
    index,
    notify = false
  ) {
    if (
      index < 0 ||
      index >= values.length
    ) {
      return;
    }

    currentIndex =
      index;

    update();

    if (
      notify &&
      onChange
    ) {
      onChange(
        currentIndex,
        values[
          currentIndex
        ],
        controls[
          currentIndex
        ]
      );
    }
  }

  return {
    widgets: controls,
    getValue,
    getIndex,
    setValue
  };
}


/* =========================================================
 * INPUT
 * ========================================================= */

export function inputField(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 300,
    h = 64,

    value = "",
    placeholder = "Enter text",

    type = inputType.CHAR,

    backgroundColor =
      theme.surface,

    pressedColor =
      theme.surface2,

    textColor =
      theme.text,

    placeholderColor =
      theme.textMuted,

    textSize = 22,

    font,

    radius =
      Math.floor(h / 2),

    onChange = null,
    onCancel = null
  } = options;

  let currentValue =
    String(value);

  let keyboardOpen = false;
  let keyboard = null;

  const field =
    createWidget(
      widget.BUTTON,
      {
        x,
        y,

        w,
        h,

        text:
          currentValue.length
            ? currentValue
            : placeholder,

        color:
          currentValue.length
            ? textColor
            : placeholderColor,

        text_size:
          textSize,

        ...(font !== undefined
          ? { font }
          : {}),

        normal_color:
          backgroundColor,

        press_color:
          pressedColor,

        radius,

        click_func:
          openKeyboard
      }
    );

  function update() {
    field.setProperty(
      prop.MORE,
      {
        x,
        y,

        w,
        h,

        text:
          currentValue.length
            ? currentValue
            : placeholder,

        color:
          currentValue.length
            ? textColor
            : placeholderColor,

        text_size:
          textSize,

        ...(font !== undefined
          ? { font }
          : {}),

        normal_color:
          backgroundColor,

        press_color:
          pressedColor,

        radius
      }
    );
  }

  function openKeyboard() {
    if (keyboardOpen) {
      return;
    }

    keyboardOpen = true;

    keyboard =
      createKeyboard({
        inputType:
          type,

        text:
          currentValue,

        onComplete: (
          _,
          result
        ) => {

          currentValue =
            result &&
            result.data !== undefined
              ? String(
                  result.data
                )
              : "";

          update();

          keyboardOpen =
            false;

          keyboard = null;

          if (onChange) {
            onChange(
              currentValue,
              field
            );
          }

          deleteKeyboard();
        },

        onCancel: (
          _,
          result
        ) => {

          keyboardOpen =
            false;

          keyboard = null;

          if (onCancel) {
            onCancel(
              result,
              field
            );
          }

          deleteKeyboard();
        }
      });
  }

  function setValue(
    newValue,
    notify = false
  ) {
    currentValue =
      newValue === null ||
      newValue === undefined
        ? ""
        : String(newValue);

    update();

    if (
      notify &&
      onChange
    ) {
      onChange(
        currentValue,
        field
      );
    }
  }

  function getValue() {
    return currentValue;
  }

  return {
    widget: field,
    getValue,
    setValue,
    focus: openKeyboard
  };
}


export function numberInput(
  options = {}
) {
  return inputField({
    ...options,

    type:
      inputType.NUM
  });
}


/* =========================================================
 * GENERAL PICKER
 * ========================================================= */

/**
 * Create a general Zepp picker.
 *
 * Zepp emits event type 2 when the current selection
 * is confirmed.
 *
 * ZeppCore automatically deletes the picker after
 * the confirmation event so the picker screen closes.
 */
export function picker(
  options = {}
) {
  const {
    columns = 1,

    dataConfig = [],

    title,
    subtitle,

    doneIcon,

    normalColor,
    selectColor,

    font,

    initialColumn = 0,

    onChange = null,

    closeOnConfirm = true
  } = options;

  const fontDataConfig =
    Array.isArray(dataConfig)
      ? dataConfig.map(
          (column) => {
            if (
              !column ||
              font === undefined
            ) {
              return column;
            }

            return {
              ...column,
              font_name:
                column.font_name ??
                font
            };
          }
        )
      : dataConfig;

  const params = {
    nb_of_columns:
      columns,

    data_config:
      fontDataConfig,

    init_col_index:
      initialColumn
  };

  if (title !== undefined) {
    params.title =
      title;
  }

  if (subtitle !== undefined) {
    params.subtitle =
      subtitle;
  }

  if (doneIcon !== undefined) {
    params.done_icon =
      doneIcon;
  }

  if (normalColor !== undefined) {
    params.normal_color =
      normalColor;
  }

  if (selectColor !== undefined) {
    params.select_color =
      selectColor;
  }


  params.picker_cb = (
    pickerWidget,
    eventType,
    column,
    valueIndex
  ) => {

    /*
     * Give the application its normal callback first.
     */
    if (onChange) {
      onChange(
        pickerWidget,
        eventType,
        column,
        valueIndex
      );
    }


    /*
     * Zepp documents event type 2 as the selection
     * event. When enabled, close the picker by deleting
     * the widget.
     */
    if (
      closeOnConfirm &&
      eventType === 2
    ) {
      deleteWidget(
        pickerWidget
      );
    }
  };


  return createWidget(
    widget.WIDGET_PICKER,
    params
  );
}


/* =========================================================
 * TIME PICKER
 * ========================================================= */

/**
 * User-friendly time picker.
 *
 * Internally uses the working general PICKER so it
 * behaves consistently on the Bip 6.
 */
export function timePicker(
  options = {}
) {
  const {
    title = "Select Time",

    hour = 12,
    minute = 0,

    font,

    onChange = null
  } = options;

  const hours = [];

  for (
    let i = 1;
    i <= 12;
    i++
  ) {
    hours.push(
      String(i)
    );
  }

  const minutes = [];

  for (
    let i = 0;
    i < 60;
    i++
  ) {
    minutes.push(
      String(i).padStart(
        2,
        "0"
      )
    );
  }

  const periods = [
    "AM",
    "PM"
  ];

  const safeHour = clamp(
    hour,
    0,
    23
  );

  const selected = {
    hour12:
      safeHour % 12 || 12,

    minute:
      clamp(
        minute,
        0,
        59
      ),

    period:
      safeHour >= 12
        ? 1
        : 0
  };

  return picker({
    columns: 3,

    title,

    font,

    dataConfig: [
      {
        data_array:
          hours,

        support_loop:
          true,

        init_val_index:
          selected.hour12 - 1,

        font_size:
          32,

        select_font_size:
          42,

        col_width:
          90
      },

      {
        data_array:
          minutes,

        support_loop:
          true,

        init_val_index:
          selected.minute,

        font_size:
          32,

        select_font_size:
          42,

        col_width:
          90
      },

      {
        data_array:
          periods,

        support_loop:
          false,

        init_val_index:
          selected.period,

        font_size:
          30,

        select_font_size:
          40,

        col_width:
          90
      }
    ],

    onChange: (
      pickerWidget,
      eventType,
      column,
      valueIndex
    ) => {
      if (column === 0) {
        selected.hour12 =
          Number(valueIndex) + 1;
      }

      if (column === 1) {
        selected.minute =
          Number(valueIndex);
      }

      if (column === 2) {
        selected.period =
          Number(valueIndex);
      }

      let selectedHour =
        selected.hour12 % 12;

      if (selected.period === 1) {
        selectedHour += 12;
      }

      if (onChange) {
        onChange({
          picker:
            pickerWidget,

          eventType,

          column,

          valueIndex,

          hour:
            selectedHour,

          minute:
            selected.minute
        });
      }
    }
  });
}


/* =========================================================
 * DATE PICKER
 * ========================================================= */

/**
 * User-friendly date picker.
 *
 * Internally uses the working general PICKER.
 */
export function datePicker(
  options = {}
) {
  const {
    title = "Select Date",

    year = 2026,
    month = 1,
    day = 1,

    startYear = 2020,
    endYear = 2035,

    font,

    onChange = null
  } = options;


  const years = [];

  for (
    let value = startYear;
    value <= endYear;
    value++
  ) {
    years.push(
      String(value)
    );
  }


  const months = [];

  for (
    let i = 1;
    i <= 12;
    i++
  ) {
    months.push(
      String(i).padStart(
        2,
        "0"
      )
    );
  }


  const days = [];

  for (
    let i = 1;
    i <= 31;
    i++
  ) {
    days.push(
      String(i).padStart(
        2,
        "0"
      )
    );
  }


  const selected = {
    year:
      clamp(
        year,
        startYear,
        endYear
      ),

    month:
      clamp(
        month,
        1,
        12
      ),

    day:
      clamp(
        day,
        1,
        31
      )
  };


  return picker({
    columns: 3,

    title,

    font,

    dataConfig: [
      {
        data_array:
          years,

        support_loop:
          false,

        init_val_index:
          selected.year -
          startYear,

        font_size:
          26,

        select_font_size:
          36,

        col_width:
          110
      },

      {
        data_array:
          months,

        support_loop:
          true,

        init_val_index:
          selected.month - 1,

        font_size:
          26,

        select_font_size:
          36,

        col_width:
          70
      },

      {
        data_array:
          days,

        support_loop:
          true,

        init_val_index:
          selected.day - 1,

        font_size:
          26,

        select_font_size:
          36,

        col_width:
          70
      }
    ],

    onChange: (
      pickerWidget,
      eventType,
      column,
      valueIndex
    ) => {

      /*
       * Keep all three columns synchronized.
       */
      if (column === 0) {
        selected.year =
          startYear +
          valueIndex;
      }

      if (column === 1) {
        selected.month =
          valueIndex + 1;
      }

      if (column === 2) {
        selected.day =
          valueIndex + 1;
      }


      if (onChange) {

        onChange({
          picker:
            pickerWidget,

          eventType,

          column,

          year:
            selected.year,

          month:
            selected.month,

          day:
            selected.day
        });

      }
    }
  });
}


/* =========================================================
 * PAGE INDICATOR
 * ========================================================= */

export function pageIndicator(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 300,
    h = 40,

    selectedColor =
      theme.accent,

    unselectedColor =
      theme.surface2,

    spacing = 8,

    elementWidth = 8,
    elementHeight = 8,

    horizontal = true
  } = options;

  return createWidget(
    widget.PAGE_INDICATOR,
    {
      x,
      y,

      w,
      h,

      h_space:
        spacing,

      horizontal,

      use_color:
        true,

      select_color:
        selectedColor,

      unselect_color:
        unselectedColor,

      element_height:
        elementHeight,

      element_radius:
        Math.floor(
          elementWidth / 2
        ),

      align_h:
        align.CENTER_H
    }
  );
}


/* =========================================================
 * COMBINED COMPONENTS
 * ========================================================= */

export function sectionTitle(
  options = {}
) {
  const {
    x = 20,
    y = 0,

    w = 350,
    h = 32,

    text: label = "",

    color =
      theme.textMuted,

    size = 16,

    font,

    alignH =
      align.LEFT
  } = options;

  return text({
    x,
    y,

    w,
    h,

    value:
      label,

    color,
    size,

    font,

    alignH,

    alignV:
      align.CENTER_V
  });
}


export function header(
  options = {}
) {
  const {
    x = 20,
    y = 20,

    w = 350,

    title = "",
    subtitle = null,

    titleSize = 30,
    subtitleSize = 16,

    titleColor =
      theme.text,

    subtitleColor =
      theme.textMuted,

    font
  } = options;

  const widgets = [];


  widgets.push(
    text({
      x,
      y,

      w,

      h:
        subtitle !== null
          ? 42
          : 50,

      value:
        title,

      color:
        titleColor,

      size:
        titleSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  if (subtitle !== null) {

    widgets.push(
      text({
        x,

        y:
          y + 40,

        w,

        h: 25,

        value:
          subtitle,

        color:
          subtitleColor,

        size:
          subtitleSize,

        font,

        alignH:
          align.LEFT,

        alignV:
          align.CENTER_V
      })
    );

  }


  return {
    widgets
  };
}


export function infoCard(
  options = {}
) {
  const {
    x = 20,
    y = 0,

    w = 350,
    h = 120,

    title = "",
    value = "",
    subtitle = null,

    backgroundColor =
      theme.surface,

    radius =
      theme.radius,

    titleColor =
      theme.textMuted,

    valueColor =
      theme.text,

    subtitleColor =
      theme.textMuted,

    titleSize = 16,
    valueSize = 34,
    subtitleSize = 15,

    font,

    onClick = null
  } = options;

  const widgets = [];


  widgets.push(
    card({
      x,
      y,

      w,
      h,

      color:
        backgroundColor,

      radius,

      onClick
    })
  );


  widgets.push(
    text({
      x:
        x + 18,

      y:
        y + 12,

      w:
        w - 36,

      h: 25,

      value:
        title,

      color:
        titleColor,

      size:
        titleSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  widgets.push(
    text({
      x:
        x + 18,

      y:
        y + 35,

      w:
        w - 36,

      h: 46,

      value,

      color:
        valueColor,

      size:
        valueSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  if (subtitle !== null) {

    widgets.push(
      text({
        x:
          x + 18,

        y:
          y + h - 30,

        w:
          w - 36,

        h: 22,

        value:
          subtitle,

        color:
          subtitleColor,

        size:
          subtitleSize,

        font,

        alignH:
          align.LEFT,

        alignV:
          align.CENTER_V
      })
    );

  }


  return {
    widgets
  };
}


export function statCard(
  options = {}
) {
  const {
    x = 0,
    y = 0,

    w = 165,
    h = 100,

    label = "",
    value = "",

    backgroundColor =
      theme.surface,

    valueColor =
      theme.text,

    labelColor =
      theme.textMuted,

    valueSize = 30,
    labelSize = 14,

    font,

    radius =
      theme.radius,

    onClick = null
  } = options;

  const widgets = [];


  widgets.push(
    card({
      x,
      y,

      w,
      h,

      color:
        backgroundColor,

      radius,

      onClick
    })
  );


  widgets.push(
    text({
      x:
        x + 14,

      y:
        y + 12,

      w:
        w - 28,

      h: 22,

      value:
        label,

      color:
        labelColor,

      size:
        labelSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  widgets.push(
    text({
      x:
        x + 14,

      y:
        y + 38,

      w:
        w - 28,

      h: 45,

      value,

      color:
        valueColor,

      size:
        valueSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  return {
    widgets
  };
}


export function settingRow(
  options = {}
) {
  const {
    x = 20,
    y = 0,

    w = 350,
    h = 90,

    title = "",
    description = null,

    value = false,

    switchWidth = 100,
    switchHeight = 46,

    backgroundColor =
      theme.surface,

    titleColor =
      theme.text,

    descriptionColor =
      theme.textMuted,

    titleSize = 20,
    descriptionSize = 14,

    font,

    onChange = null,
    onClick = null
  } = options;

  const widgets = [];


  widgets.push(
    card({
      x,
      y,

      w,
      h,

      color:
        backgroundColor,

      onClick
    })
  );


  widgets.push(
    text({
      x:
        x + 18,

      y:
        y + 12,

      w:
        w -
        switchWidth -
        45,

      h: 28,

      value:
        title,

      color:
        titleColor,

      size:
        titleSize,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  if (description !== null) {

    widgets.push(
      text({
        x:
          x + 18,

        y:
          y + 42,

        w:
          w -
          switchWidth -
          45,

        h: 22,

        value:
          description,

        color:
          descriptionColor,

        size:
          descriptionSize,

        font,

        alignH:
          align.LEFT,

        alignV:
          align.CENTER_V
      })
    );

  }


  const switchWidget =
    switchControl({
      x:
        x +
        w -
        switchWidth -
        15,

      y:
        y +
        Math.floor(
          (
            h -
            switchHeight
          ) / 2
        ),

      w:
        switchWidth,

      h:
        switchHeight,

      value,

      font,

      onChange
    });


  widgets.push(
    switchWidget.widget
  );


  return {
    widgets,

    switch:
      switchWidget,

    getValue:
      switchWidget.getValue,

    setValue:
      switchWidget.setValue
  };
}


export function buttonRow(
  options = {}
) {
  const {
    x = 20,
    y = 0,

    w = 350,
    h = 90,

    title = "",
    description = null,

    buttonText =
      "OPEN",

    buttonWidth = 105,
    buttonHeight = 48,

    backgroundColor =
      theme.surface,

    titleColor =
      theme.text,

    descriptionColor =
      theme.textMuted,

    font,

    onClick = null,
    onCardClick = null
  } = options;

  const widgets = [];


  widgets.push(
    card({
      x,
      y,

      w,
      h,

      color:
        backgroundColor,

      onClick:
        onCardClick
    })
  );


  widgets.push(
    text({
      x:
        x + 18,

      y:
        y + 12,

      w:
        w -
        buttonWidth -
        45,

      h: 28,

      value:
        title,

      color:
        titleColor,

      size: 20,

      font,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  if (description !== null) {

    widgets.push(
      text({
        x:
          x + 18,

        y:
          y + 43,

        w:
          w -
          buttonWidth -
          45,

        h: 22,

        value:
          description,

        color:
          descriptionColor,

        size: 14,

        font,

        alignH:
          align.LEFT,

        alignV:
          align.CENTER_V
      })
    );

  }


  const actionButton =
    pill({
      x:
        x +
        w -
        buttonWidth -
        15,

      y:
        y +
        Math.floor(
          (
            h -
            buttonHeight
          ) / 2
        ),

      w:
        buttonWidth,

      h:
        buttonHeight,

      text:
        buttonText,

      textSize: 17,

      font,

      onClick
    });


  widgets.push(
    actionButton
  );


  return {
    widgets,
    button:
      actionButton
  };
}


export function progressCard(
  options = {}
) {
  const {
    x = 20,
    y = 0,

    w = 350,
    h = 105,

    title = "",
    subtitle = null,

    value = 0,
    max = 100,

    backgroundColor =
      theme.surface,

    fillColor =
      theme.accent,

    titleColor =
      theme.text,

    subtitleColor =
      theme.textMuted,

    valueColor =
      theme.text
  } = options;

  const widgets = [];


  widgets.push(
    card({
      x,
      y,

      w,
      h,

      color:
        backgroundColor
    })
  );


  widgets.push(
    text({
      x:
        x + 18,

      y:
        y + 12,

      w:
        w - 100,

      h: 25,

      value:
        title,

      color:
        titleColor,

      size: 19,

      alignH:
        align.LEFT,

      alignV:
        align.CENTER_V
    })
  );


  widgets.push(
    text({
      x:
        x + w - 85,

      y:
        y + 12,

      w: 65,

      h: 25,

      value:
        `${Math.round(
          (
            value /
            Math.max(
              max,
              1
            )
          ) *
          100
        )}%`,

      color:
        valueColor,

      size: 18,

      alignH:
        align.RIGHT,

      alignV:
        align.CENTER_V
    })
  );


  const progress =
    progressBar({
      x:
        x + 18,

      y:
        y + 48,

      w:
        w - 36,

      h: 14,

      value,
      max,

      backgroundColor:
        theme.surface2,

      fillColor
    });


  widgets.push(
    progress.background
  );

  widgets.push(
    progress.fill
  );


  if (subtitle !== null) {

    widgets.push(
      text({
        x:
          x + 18,

        y:
          y + 70,

        w:
          w - 36,

        h: 20,

        value:
          subtitle,

        color:
          subtitleColor,

        size: 13,

        alignH:
          align.LEFT,

        alignV:
          align.CENTER_V
      })
    );

  }


  return {
    widgets,
    progress
  };
}


/* =========================================================
 * UTILITY
 * ========================================================= */

function clamp(
  value,
  min,
  max
) {
  return Math.max(
    min,
    Math.min(
      max,
      value
    )
  );
}


function calculatePercentageWidth(
  width,
  value,
  max
) {
  if (max <= 0) {
    return 0;
  }

  return Math.round(
    width *
    (
      clamp(
        value,
        0,
        max
      ) /
      max
    )
  );
}


/* =========================================================
 * NATIVE EXPORTS
 * ========================================================= */

export {
  widget,
  align,
  text_style,
  event,
  prop,
  inputType
};