using Microsoft.AspNetCore.Components.Web;
using System.Text;
using System.Timers;

namespace williamsteadcom.Pages.Games;

public partial class Minesweeper : IDisposable
{
    private readonly Random _random = new();
    private readonly System.Timers.Timer _timer = new(1000);

    private bool _disposedValue;

    private int FlagCount { get; set; }

    private string GameClock
    {
        get
        {
            if (!GameStart.HasValue)
            {
                return "000";
            }

            return GameEnd.HasValue
                ? (GameEnd.Value - GameStart.Value).TotalSeconds.ToString("000")
                : (DateTime.Now - GameStart.Value).TotalSeconds.ToString("000");
        }
    }

    private DateTime? GameEnd { get; set; }

    private bool GameOver { get; set; }

    private DateTime? GameStart { get; set; }

    private int MineCount { get; set; } = 10;

    private int RevealedCount { get; set; }

    private int Size { get; set; }

    private Square[][] Squares { get; set; } = Array.Empty<Square[]>();

    private bool Win { get; set; }

    private int XRange { get; set; } = 8;

    private int YRange { get; set; } = 8;

    protected override void OnInitialized()
    {
        _timer.Elapsed += UpdateClock;
        FillGameboard();
    }

    public void Dispose()
    {
        // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        Dispose(disposing: true);
        GC.SuppressFinalize(this);
    }

    protected virtual void Dispose(bool disposing)
    {
        if (!_disposedValue)
        {
            if (disposing)
            {
                _timer.Dispose();
            }

            _disposedValue = true;
        }
    }

    private static string GetSquareClass(Square square)
    {
        var sb = new StringBuilder("minesquare");
        if (square.HasMine)
        {
            sb.Append(" mined");
        }
        if (square.IsFlagged)
        {
            sb.Append(" flagged");
        }
        if (square.IsRevealed)
        {
            sb.Append(" revealed");
        }
        if (square.MinedNeighbors > 0)
        {
            sb.Append($" mines-{square.MinedNeighbors}");
        }
        return sb.ToString();
    }

    private void FillGameboard()
    {
        FlagCount = 0;
        RevealedCount = 0;
        Squares = new Square[XRange][];
        for (var i = 0; i < XRange; i++)
        {
            Squares[i] = new Square[YRange];
            for (var j = 0; j < YRange; j++)
            {
                Squares[i][j] = new()
                {
                    X = (byte)i,
                    Y = (byte)j,
                };
            }
        }

        for (var i = 0; i < MineCount; i++)
        {
            var (mineX, mineY) = GetMineCoords();
            if (mineX >= 0)
            {
                Squares[mineX][mineY].HasMine = true;

                for (var y = Math.Max(0, mineY - 1); y <= Math.Min(YRange - 1, mineY + 1); y++)
                {
                    for (var x = Math.Max(0, mineX - 1); x <= Math.Min(XRange - 1, mineX + 1); x++)
                    {
                        if (x != mineX || y != mineY)
                        {
                            Squares[x][y].MinedNeighbors++;
                        }
                    }
                }
            }
        }
    }

    private string GetGameClass()
    {
        if (GameOver)
        {
            return "gameover text-center d-flex flex-column flex-grow-1";
        }
        else if (Win)
        {
            return "win text-center d-flex flex-column flex-grow-1";
        }
        else
        {
            return "text-center d-flex flex-column flex-grow-1";
        }
    }

    private (int x, int y) GetMineCoords(int depth = 0)
    {
        var x = _random.Next(XRange);
        var y = _random.Next(YRange);
        if (Squares[x][y].HasMine)
        {
            if (depth < 20)
            {
                return GetMineCoords();
            }
            else
            {
                return (-1, -1);
            }
        }
        return (x, y);
    }

    private void OnClickSquare(Square square, MouseEventArgs e)
    {
        if (GameOver || Win)
        {
            return;
        }
        if (!GameStart.HasValue)
        {
            GameStart = DateTime.Now;
            _timer.Enabled = true;
        }
        if (e.Button == 0)
        {
            if (!square.IsRevealed && !square.IsFlagged)
            {
                RevealSquare(square);
            }
        }
        else
        {
            OnContextSquare(square);
        }
    }

    private void OnContextSquare(Square square)
    {
        if (GameOver || Win)
        {
            return;
        }
        if (!GameStart.HasValue)
        {
            GameStart = DateTime.Now;
            _timer.Enabled = true;
        }
        if (square.IsRevealed)
        {
            RevealSquare(square, true);
        }
        else
        {
            square.IsFlagged = true;
            FlagCount++;
        }
    }

    private void OnSetSize(int value)
    {
        Size = value;
        OnStart();
    }

    private void OnStart()
    {
        GameOver = false;
        Win = false;
        GameEnd = null;
        GameStart = null;
        if (Size == 0)
        {
            MineCount = 10;
            XRange = 8;
            YRange = 8;
        }
        else if (Size == 1)
        {
            MineCount = 40;
            XRange = 16;
            YRange = 16;
        }
        else
        {
            MineCount = 99;
            XRange = 30;
            YRange = 16;
        }
        FillGameboard();
    }

    private void RevealSquare(Square square, bool revealAll = false)
    {
        if (square.IsFlagged)
        {
            return;
        }

        var safe = revealAll;
        if (!square.IsRevealed)
        {
            if (RevealedCount == 0)
            {
                for (var y = Math.Max(0, square.Y - 1); y <= Math.Min(YRange - 1, square.Y + 1); y++)
                {
                    for (var x = Math.Max(0, square.X - 1); x <= Math.Min(XRange - 1, square.X + 1); x++)
                    {
                        if (Squares[x][y].HasMine)
                        {
                            Squares[x][y].HasMine = false;
                            for (var y2 = Math.Max(0, y - 1); y2 <= Math.Min(YRange - 1, y + 1); y2++)
                            {
                                for (var x2 = Math.Max(0, x - 1); x2 <= Math.Min(XRange - 1, x + 1); x2++)
                                {
                                    if (x2 != x || y2 != y)
                                    {
                                        Squares[x2][y2].MinedNeighbors--;
                                    }
                                }
                            }
                            int newX, newY;
                            var count = 0;
                            do
                            {
                                (newX, newY) = GetMineCoords();
                                count++;
                            } while (count < 20 && newX >= square.X - 1 && newX <= square.X + 1 && newY >= square.Y - 1 && newY <= square.Y + 1);
                            if (newX >= 0)
                            {
                                Squares[newX][newY].HasMine = true;
                                for (var y2 = Math.Max(0, newY - 1); y2 <= Math.Min(YRange - 1, newY + 1); y2++)
                                {
                                    for (var x2 = Math.Max(0, newX - 1); x2 <= Math.Min(XRange - 1, newX + 1); x2++)
                                    {
                                        if (x2 != newX || y2 != newY)
                                        {
                                            Squares[x2][y2].MinedNeighbors++;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            square.IsRevealed = true;
            RevealedCount++;
            if (square.HasMine)
            {
                GameOver = true;
                GameEnd = DateTime.Now;
                _timer.Enabled = false;
            }
            else if (RevealedCount >= ((XRange * YRange) - MineCount))
            {
                Win = true;
                GameEnd = DateTime.Now;
                _timer.Enabled = false;
            }
            revealAll |= square.MinedNeighbors == 0;
        }

        if (!revealAll)
        {
            return;
        }
        if (safe)
        {
            var flaggedNeighbors = 0;
            for (var y = Math.Max(0, square.Y - 1); y <= Math.Min(YRange - 1, square.Y + 1); y++)
            {
                for (var x = Math.Max(0, square.X - 1); x <= Math.Min(XRange - 1, square.X + 1); x++)
                {
                    if (Squares[x][y].IsFlagged)
                    {
                        flaggedNeighbors++;
                    }
                }
            }
            if (flaggedNeighbors < square.MinedNeighbors)
            {
                return;
            }
        }

        for (var y = Math.Max(0, square.Y - 1); y <= Math.Min(YRange - 1, square.Y + 1); y++)
        {
            for (var x = Math.Max(0, square.X - 1); x <= Math.Min(XRange - 1, square.X + 1); x++)
            {
                if (!Squares[x][y].HasMine && !Squares[x][y].IsRevealed)
                {
                    RevealSquare(Squares[x][y]);
                }
            }
        }
    }

    private async void UpdateClock(object? sender, ElapsedEventArgs e)
        => await InvokeAsync(StateHasChanged);

    private class Square
    {
        public bool HasMine { get; set; }
        public bool IsFlagged { get; set; }
        public bool IsRevealed { get; set; }
        public byte MinedNeighbors { get; set; }
        public byte X { get; set; }
        public byte Y { get; set; }
    }
}