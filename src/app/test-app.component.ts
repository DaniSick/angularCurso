import { Component } from '@angular/core';

@Component({
  selector: 'app-test',
  standalone: true,
  template: `
    <div style="padding: 20px; text-align: center;">
      <h1>Test Component</h1>
      <p>Si puedes ver este texto, Angular está funcionando correctamente.</p>
    </div>
  `
})
export class TestAppComponent {}
