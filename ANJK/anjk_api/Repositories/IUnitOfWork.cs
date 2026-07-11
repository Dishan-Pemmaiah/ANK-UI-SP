namespace anjk_api.Repositories
{
    public interface IUnitOfWork
    {
        IRepository<T> Repository<T>() where T : class;
        Task<int> CompleteAsync();
    }
}