module.exports = "\nuniform sampler2D u_Data;\nuniform vec2 u_TextureSize;\n\nvec4 getSample(in vec2 st) {\n    // Use of fract below assumes cylindrical x axis (usually lon) and non-cylindrical y axis (usually lat).\n    return texture2D(u_Data, vec2(fract(st.s), st.t));\n}\n\nfloat lookup(in vec2 st) {\n    // adapted from http://www.iquilezles.org/www/articles/hwinterpolation/hwinterpolation.htm\n    vec2 uv = st * u_TextureSize - 0.5;\n    vec2 iuv = floor(uv);\n    vec2 fuv = fract(uv);\n    vec2 ruv = 1.0 - fuv;\n\n    vec4 a = getSample((iuv + vec2(0.5, 0.5)) / u_TextureSize);  // LL\n    vec4 b = getSample((iuv + vec2(1.5, 0.5)) / u_TextureSize);  // LR\n    vec4 c = getSample((iuv + vec2(0.5, 1.5)) / u_TextureSize);  // UL\n    vec4 d = getSample((iuv + vec2(1.5, 1.5)) / u_TextureSize);  // UR\n    vec4 h;\n\n    int tag = int(dot(step(7e37, vec4(a.x, b.x, c.x, d.x)), vec4(1.0, 2.0, 4.0, 8.0)));\n    if (tag == 0) {\n        // a b c d\n        h = mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);\n    } else if (tag == 1 && ruv.y < fuv.x) {\n        // d b c\n        h = d + ruv.x * (c - d) + ruv.y * (b - d);\n    } else if (tag == 2 && fuv.x < fuv.y) {\n        // c a d\n        h = c + fuv.x * (d - c) + ruv.y * (a - c);\n    } else if (tag == 4 && fuv.x >= fuv.y) {\n        // b a d\n        h = b + ruv.x * (a - b) + fuv.y * (d - b);\n    } else if (tag == 8 && fuv.x <= ruv.y) {\n        // a b c\n        h = a + fuv.x * (b - a) + fuv.y * (c - a);\n    } else {\n        // not enough points to interpolate\n        h = vec4(7e37);\n    }\n\n    return scalarize(h);\n}\n"