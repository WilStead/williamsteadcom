using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Tavenem.Blazor.IndexedDB;
using williamsteadcom;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

builder.Services.AddTavenemFramework();

var db = new IndexedDb<string>("williamsteadcom", 1);
builder.Services.AddIndexedDb(db);

await builder.Build().RunAsync();
