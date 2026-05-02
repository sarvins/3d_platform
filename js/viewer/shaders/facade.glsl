// facade.glsl — Step 2 groundwork (NOT yet wired to any UI control)
// Usage: split on "// --- FRAGMENT ---" to get vertex and fragment shaders for THREE.ShaderMaterial

// --- VERTEX ---
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// --- FRAGMENT ---
uniform float glazing_ratio;  // 0.30 to 0.80 (30% to 80% window area)

varying vec2 vUv;

void main() {
  // Divide facade into horizontal bands per floor (assume ~10 floors visible)
  float floorUv = fract(vUv.y * 10.0);

  // Window occupies the middle glazing_ratio of each floor band
  float margin = (1.0 - glazing_ratio) * 0.5;
  bool isGlazing = floorUv > margin && floorUv < (1.0 - margin);

  vec4 wallColor   = vec4(0.784, 0.706, 0.604, 1.0);  // #C8B49A
  vec4 glassColor  = vec4(0.706, 0.824, 0.941, 0.75); // light blue glass

  gl_FragColor = isGlazing ? glassColor : wallColor;
}
