using Microsoft.AspNetCore.Components;
using Tavenem.Blazor.IndexedDB;

namespace williamsteadcom.Pages;

public partial class SermonCalculator
{
    private static readonly char[] _Delimiters = new[] { ' ', '\r', '\n', '\t' };

    [Inject] private IndexedDbService<string> IndexedDb { get; set; } = default!;

    private double ReadingTime { get; set; }

    private List<Sermon> Sermons { get; set; } = new();

    private string? SermonText { get; set; }

    private int WordCount { get; set; }

    private int WordsPerMinute { get; set; } = 130;

    protected override async Task OnInitializedAsync()
    {
        var data = await IndexedDb.GetValueAsync<SermonData>("sermondata");
        if (data is not null)
        {
            if (data.Sermons is not null)
            {
                Sermons = data.Sermons.ToList();
            }

            if (data.WordsPerMinute > 0)
            {
                WordsPerMinute = data.WordsPerMinute;
            }
        }
    }

    private async Task OnClearAsync()
    {
        Sermons.Clear();
        await SaveDataAsync();
    }

    private async Task OnSaveAsync()
    {
        if (string.IsNullOrWhiteSpace(SermonText))
        {
            return;
        }

        var sermon = new Sermon
        {
            Lead = SermonText[..Math.Min(SermonText.Length, 10)] + "...",
            WordCount = WordCount,
        };

        Sermons.Add(sermon);
        await SaveDataAsync();
    }

    private void OnTextChanged(string? value)
    {
        SermonText = value;
        WordCount = string.IsNullOrWhiteSpace(value)
            ? 0
            : value.Split(_Delimiters, StringSplitOptions.RemoveEmptyEntries).Length;
        UpdateReadingTime();
    }

    private void OnWordsPerMinuteChanged(int value)
    {
        WordsPerMinute = value;
        UpdateReadingTime();
    }

    private async Task SaveDataAsync()
    {
        if (Sermons.Count == 0)
        {
            await IndexedDb.DeleteKeyAsync(SermonData.Id);
            return;
        }

        var data = new SermonData
        {
            Sermons = Sermons.ToArray(),
            WordsPerMinute = WordsPerMinute,
        };
        await IndexedDb.PutValueAsync(data);
    }

    private void UpdateReadingTime() => ReadingTime = WordCount / WordsPerMinute;

    private class Sermon
    {
        public string? Lead { get; set; }
        public int WordCount { get; set; }

        public void Deconstruct(out string? lead, out int wordCount)
        {
            lead = Lead;
            wordCount = WordCount;
        }
    }

    private class SermonData
    {
        public static string Id => "sermondata";

        public Sermon[]? Sermons { get; set; }

        public int WordsPerMinute { get; set; }
    }
}